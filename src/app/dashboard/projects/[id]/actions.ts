"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deployBuild, logEntriesToString, type BuildEnvVars } from "@/lib/build";

export async function deployProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: { envVars: true },
  });
  if (!project) throw new Error("Project not found");

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
      branch: "main",
      commitSha: crypto.randomUUID().slice(0, 40),
      commitMsg: "Manual deploy",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);

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

  revalidatePath(`/dashboard/projects/${project.id}`);
}
