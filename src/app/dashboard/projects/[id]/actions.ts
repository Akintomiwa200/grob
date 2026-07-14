"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deployBuild, logEntriesToString, type BuildEnvVars } from "@/lib/build";
import { getLatestCommit } from "@/lib/github";

async function getCommitInfo(project: { gitUrl: string; userId: string }) {
  const repoFullName = project.gitUrl
    ?.replace("https://github.com/", "")
    ?.replace(".git", "");

  if (!repoFullName || !repoFullName.includes("/")) return null;
  return getLatestCommit(project.userId, repoFullName);
}

export async function deployProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: { envVars: true },
  });
  if (!project) throw new Error("Project not found");

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

  const commit = await getCommitInfo(project);

  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "building",
      branch: commit?.branch || "main",
      commitSha: commit?.sha || crypto.randomUUID().slice(0, 40),
      commitMsg: commit?.message || "Manual deploy",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);

  const entries: import("@/lib/build").LogEntry[] = [];

  const url = await deployBuild(
    {
      name: project.name,
      slug: project.slug,
      gitUrl: project.gitUrl,
      installCommand: project.installCommand,
      buildCommand: project.buildCommand,
      outputDir: project.outputDir,
      framework: project.framework,
    },
    deployment.id,
    (entry) => {
      entries.push(entry);
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

  revalidatePath(`/dashboard/projects/${project.id}`);
  revalidatePath(`/dashboard/projects/${project.id}/deployments`);
}

export async function autoRedeploy(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      envVars: true,
      deployments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!project) throw new Error("Project not found");
  if (project.deployments.length === 0) return;
  const latest = project.deployments[0];
  if (latest.status === "building" || latest.status === "pending") return;
  // Only redeploy if latest was successful (not if it failed — user should fix first)
  if (latest.status !== "success") return;

  await deployProject(projectId);
}
