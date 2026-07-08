"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function rollbackToDeployment(
  projectId: string,
  deploymentId: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  const source = await prisma.deployment.findFirst({
    where: { id: deploymentId, projectId, status: "success" },
  });
  if (!source) throw new Error("Deployment not found or not successful");

  const newDeployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "deploying",
      branch: source.branch,
      commitSha: source.commitSha,
      commitMsg: `Rollback to ${source.commitSha.slice(0, 7)}`,
      alias: source.alias,
      url: source.url,
    },
  });

  await prisma.deployment.update({
    where: { id: newDeployment.id },
    data: {
      status: "success",
      logs: `Rolled back to deployment ${source.id.slice(0, 8)} (${source.commitSha.slice(0, 7)})\nRestored from snapshot at ${new Date(source.createdAt).toLocaleString()}`,
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(
    `/dashboard/projects/${projectId}/deployments/${deploymentId}`,
  );
}
