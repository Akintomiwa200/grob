import { prisma } from "@/lib/prisma";
import { deployBuild, logEntriesToString, type BuildEnvVars } from "@/lib/build";

export async function POST(
  req: Request,
  props: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await props.params;

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: {
      webhooks: { where: { active: true } },
      envVars: true,
    },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const commitMsg = body?.head_commit?.message || body?.commits?.[0]?.message || "Auto-deploy via webhook";
  const commitSha = body?.after || body?.head_commit?.id || crypto.randomUUID().slice(0, 40);
  const branch = (body?.ref || "refs/heads/main").replace("refs/heads/", "");

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

  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "building",
      branch,
      commitSha,
      commitMsg,
    },
  });

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
    (entry) => entries.push(entry),
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

  return Response.json({
    ok: true,
    deploymentId: deployment.id,
    status: url ? "success" : "failed",
  });
}
