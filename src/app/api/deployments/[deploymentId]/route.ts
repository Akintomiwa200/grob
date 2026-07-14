import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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

  await prisma.deployment.delete({ where: { id: deploymentId } });

  return Response.json({ ok: true });
}
