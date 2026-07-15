"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function listWorkflows(projectId: string) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  return prisma.workflow.findMany({
    where: { projectId },
    include: {
      _count: { select: { runs: true } },
      runs: { orderBy: { startedAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkflow(workflowId: string) {
  const userId = await requireUser();
  return prisma.workflow.findFirst({
    where: { id: workflowId, project: { userId } },
    include: {
      runs: {
        orderBy: { startedAt: "desc" },
        take: 20,
        include: { project: { select: { name: true, slug: true } } },
      },
      _count: { select: { runs: true } },
    },
  });
}

export async function createWorkflow(
  projectId: string,
  data: {
    name: string;
    trigger?: string;
    branch?: string;
    steps?: string;
  }
) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  const workflow = await prisma.workflow.create({
    data: {
      projectId,
      name: data.name,
      trigger: data.trigger ?? "push",
      branch: data.branch ?? "main",
      steps: data.steps ?? JSON.stringify(["Build", "Test", "Deploy"]),
    },
  });

  revalidatePath("/dashboard/workflows");
  revalidatePath(`/dashboard/projects/${projectId}/workflows`);
  return workflow;
}

export async function updateWorkflow(
  workflowId: string,
  data: Partial<{
    name: string;
    trigger: string;
    branch: string;
    active: boolean;
    steps: string;
  }>
) {
  const userId = await requireUser();
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, project: { userId } },
  });
  if (!workflow) throw new Error("Workflow not found");

  const updated = await prisma.workflow.update({
    where: { id: workflowId },
    data,
  });

  revalidatePath("/dashboard/workflows");
  revalidatePath(`/dashboard/workflows/${workflowId}`);
  revalidatePath(`/dashboard/projects/${workflow.projectId}/workflows`);
  return updated;
}

export async function deleteWorkflow(workflowId: string) {
  const userId = await requireUser();
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, project: { userId } },
  });
  if (!workflow) throw new Error("Workflow not found");

  await prisma.workflow.delete({ where: { id: workflowId } });
  revalidatePath("/dashboard/workflows");
  revalidatePath(`/dashboard/projects/${workflow.projectId}/workflows`);
}

export async function triggerWorkflowRun(workflowId: string) {
  const userId = await requireUser();
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, project: { userId } },
    include: { project: true },
  });
  if (!workflow) throw new Error("Workflow not found");
  if (!workflow.active) throw new Error("Workflow is paused");

  const run = await prisma.workflowRun.create({
    data: {
      workflowId,
      projectId: workflow.projectId,
      status: "running",
      branch: workflow.branch,
      commitMsg: "Manual trigger",
    },
  });

  setTimeout(async () => {
    const duration = Math.floor(Math.random() * 120000) + 10000;
    const succeeded = Math.random() > 0.1;
    await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: succeeded ? "success" : "failed",
        duration,
        finishedAt: new Date(),
        logs: succeeded
          ? `✓ Steps completed successfully\nDuration: ${Math.round(duration / 1000)}s`
          : `✗ Step failed: Build\nError: Build command exited with code 1`,
      },
    });
    revalidatePath("/dashboard/workflows");
    revalidatePath(`/dashboard/workflows/${workflowId}`);
    revalidatePath(`/dashboard/projects/${workflow.projectId}/workflows`);
  }, 3000);

  revalidatePath("/dashboard/workflows");
  revalidatePath(`/dashboard/workflows/${workflowId}`);
  return run;
}

export async function getWorkflowStats(userId: string) {
  const [workflowCount, totalRuns, recentRuns] = await Promise.all([
    prisma.workflow.count({ where: { project: { userId } } }),
    prisma.workflowRun.count({ where: { project: { userId } } }),
    prisma.workflowRun.findMany({
      where: { project: { userId } },
      select: { status: true, duration: true },
    }),
  ]);

  const successRuns = recentRuns.filter((r) => r.status === "success").length;
  const successRate = totalRuns ? Math.round((successRuns / totalRuns) * 10) / 10 : 0;
  const avgDuration =
    recentRuns.filter((r) => r.duration).length > 0
      ? Math.round(
          recentRuns
            .filter((r) => r.duration)
            .reduce((sum, r) => sum + (r.duration || 0), 0) /
            recentRuns.filter((r) => r.duration).length
        )
      : 0;

  return { workflowCount, totalRuns, successRate, avgDuration };
}
