"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { simulateBuild, logEntriesToString } from "@/lib/build-simulator";

export async function deployProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

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

  const entries: import("@/lib/build-simulator").LogEntry[] = [];

  const url = await simulateBuild(
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
