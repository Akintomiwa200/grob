import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deployBuild, logEntriesToString, type BuildEnvVars } from "@/lib/build";

async function startBuild(deploymentId: string, project: {
  name: string;
  slug: string;
  gitUrl: string | null;
  installCommand: string | null;
  buildCommand: string | null;
  outputDir: string | null;
  framework: string;
  envVars: { key: string; value: string; buildTime: boolean }[];
}) {
  const buildTimeVars: Record<string, string> = {};
  const runtimeVars: Record<string, string> = {};
  for (const ev of project.envVars) {
    if (ev.buildTime) {
      buildTimeVars[ev.key] = ev.value;
    } else {
      runtimeVars[ev.key] = ev.value;
    }
  }
  const envVars: BuildEnvVars = { buildTime: buildTimeVars, runtime: runtimeVars };

  (async () => {
    try {
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: "building" },
      }).catch(() => {});

      const entries: import("@/lib/build").LogEntry[] = [];
      const url = await deployBuild(
        {
          name: project.name,
          slug: project.slug,
          gitUrl: project.gitUrl || "",
          installCommand: project.installCommand || "",
          buildCommand: project.buildCommand || "",
          outputDir: project.outputDir || "",
          framework: project.framework,
        },
        deploymentId,
        (entry) => {
          entries.push(entry);
          prisma.deployment.update({
            where: { id: deploymentId },
            data: { logs: logEntriesToString(entries) },
          }).catch(() => {});
        },
        envVars,
      );
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: url ? "success" : "failed",
          logs: logEntriesToString(entries),
          url: url || "",
        },
      });
    } catch (error) {
      console.error("Build failed:", error);
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: "failed" },
      }).catch(() => {});
    }
  })();
}

export async function POST(
  req: Request,
  props: { params: Promise<{ deploymentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deploymentId } = await props.params;

  let body: { action?: string } = {};
  try { body = await req.json(); } catch {}
  const action = body.action || "redeploy";

  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId },
    include: { project: { include: { envVars: true } } },
  });

  if (!deployment || deployment.project.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const project = deployment.project;

  // For the original trigger (pending/building status), just start the existing deployment
  if ((action === "redeploy" || action === "deploy-latest") &&
      (deployment.status === "pending" || deployment.status === "building")) {
    await startBuild(deploymentId, project);
    return Response.json({ ok: true, deploymentId });
  }

  // For any new deployment action, create a fresh deployment record
  const newDeployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "building",
      branch: deployment.branch,
      commitSha: action === "deploy-latest"
        ? crypto.randomUUID().slice(0, 40)
        : deployment.commitSha,
      commitMsg: action === "redeploy"
        ? `Redeploy of ${deployment.commitSha.slice(0, 7)}`
        : action === "deploy-latest"
          ? "Deploy from latest commit"
          : action === "redeploy-clean"
            ? `Redeploy clean of ${deployment.commitSha.slice(0, 7)}`
            : "Promote to production",
    },
  });

  await startBuild(newDeployment.id, project);

  return Response.json({ ok: true, deploymentId: newDeployment.id });
}
