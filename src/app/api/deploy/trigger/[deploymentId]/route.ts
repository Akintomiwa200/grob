import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deployBuild, logEntriesToString, type BuildEnvVars } from "@/lib/build";

export async function POST(
  req: Request,
  props: { params: Promise<{ deploymentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deploymentId } = await props.params;

  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId },
    include: { project: { include: { envVars: true } } },
  });

  if (!deployment || deployment.project.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (deployment.status !== "pending" && deployment.status !== "building") {
    return Response.json({ ok: true, status: deployment.status });
  }

  const project = deployment.project;

  // Separate build-time and runtime env vars
  const buildTimeVars: Record<string, string> = {};
  const runtimeVars: Record<string, string> = {};
  for (const ev of project.envVars) {
    if (ev.buildTime) {
      buildTimeVars[ev.key] = ev.value;
    } else {
      runtimeVars[ev.key] = ev.value;
    }
  }

  const envVars: BuildEnvVars = {
    buildTime: buildTimeVars,
    runtime: runtimeVars,
  };

  // Run build in background — don't await, let the SSE stream pick up logs
  (async () => {
    try {
      const entries: import("@/lib/build").LogEntry[] = [];

      const url = await deployBuild(
        {
          name: project.name,
          gitUrl: project.gitUrl,
          installCommand: project.installCommand,
          buildCommand: project.buildCommand,
          outputDir: project.outputDir,
          framework: project.framework,
        },
        deployment.id,
        (entry) => {
          entries.push(entry);
          // Write logs incrementally so SSE stream can pick them up
          prisma.deployment.update({
            where: { id: deployment.id },
            data: { logs: logEntriesToString(entries) },
          }).catch(() => {});
        },
        envVars,
      );

      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: url ? "success" : "failed",
          logs: logEntriesToString(entries),
          url: url || "",
        },
      });
    } catch (error) {
      console.error("Build failed:", error);
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: "failed" },
      }).catch(() => {});
    }
  })();

  return Response.json({ ok: true, deploymentId: deployment.id });
}
