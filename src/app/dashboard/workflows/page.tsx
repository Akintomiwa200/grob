import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWorkflowStats } from "@/lib/workflow-actions";
import { WorkflowsClient } from "./WorkflowsClient";

export default async function WorkflowsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [workflows, recentRuns, stats] = await Promise.all([
    prisma.workflow.findMany({
      where: { project: { userId } },
      include: {
        _count: { select: { runs: true } },
        runs: {
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { id: true, status: true, startedAt: true, duration: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.workflowRun.findMany({
      where: { project: { userId } },
      include: { workflow: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    getWorkflowStats(userId),
  ]);

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Workflows</h1>
        <p className="text-muted text-sm mt-1">
          Automate your CI/CD pipelines with configurable build and deployment workflows.
        </p>
      </div>

      <WorkflowsClient
        initialWorkflows={workflows.map((w) => ({
          ...w,
          runs: w.runs.map((r) => ({ ...r, startedAt: r.startedAt.toISOString() })),
        }))}
        recentRuns={recentRuns.map((r) => ({
          ...r,
          startedAt: r.startedAt.toISOString(),
          finishedAt: r.finishedAt?.toISOString() ?? null,
        }))}
        stats={stats}
      />
    </div>
  );
}
