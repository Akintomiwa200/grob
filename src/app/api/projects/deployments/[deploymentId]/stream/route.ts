import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  props: { params: Promise<{ deploymentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deploymentId } = await props.params;

  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId },
    include: { project: { select: { userId: true } } },
  });

  if (!deployment || deployment.project.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  let lastLogs = deployment.logs || "";
  let lastStatus = deployment.status;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ logs: lastLogs, status: lastStatus });

      if (lastStatus === "success" || lastStatus === "failed") {
        controller.close();
        return;
      }

      const interval = setInterval(async () => {
        try {
          const current = await prisma.deployment.findUnique({
            where: { id: deploymentId },
            select: { logs: true, status: true },
          });

          if (!current) {
            clearInterval(interval);
            controller.close();
            return;
          }

          if (current.logs !== lastLogs || current.status !== lastStatus) {
            lastLogs = current.logs || "";
            lastStatus = current.status;
            send({ logs: lastLogs, status: lastStatus });
          }

          if (lastStatus === "success" || lastStatus === "failed") {
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      _req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
