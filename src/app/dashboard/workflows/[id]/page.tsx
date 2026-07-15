import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export default async function WorkflowDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

  const workflow = await prisma.workflow.findFirst({
    where: { id, project: { userId: session.user.id } },
    include: {
      runs: {
        orderBy: { startedAt: "desc" },
        take: 20,
      },
      _count: { select: { runs: true } },
    },
  });
  if (!workflow) notFound();

  let steps: string[] = [];
  try {
    steps = JSON.parse(workflow.steps);
  } catch {
    steps = ["Build", "Deploy"];
  }

  const successRuns = workflow.runs.filter((r) => r.status === "success").length;
  const avgDuration =
    workflow.runs.filter((r) => r.duration).length > 0
      ? Math.round(
          workflow.runs
            .filter((r) => r.duration)
            .reduce((s, r) => s + (r.duration || 0), 0) /
            workflow.runs.filter((r) => r.duration).length
        )
      : 0;

  function formatDuration(ms: number | null) {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  }

  const TRIGGER_LABELS: Record<string, string> = {
    push: "Push to branch",
    pr: "Pull request",
    schedule: "Scheduled",
    manual: "Manual",
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link
          href="/dashboard/workflows"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workflows
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text">
                {workflow.name}
              </h1>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  workflow.active
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {workflow.active ? "active" : "paused"}
              </span>
            </div>
            <p className="text-muted text-sm mt-1">
              Trigger:{" "}
              <code className="font-mono text-xs bg-surface/50 px-1.5 py-0.5 rounded">
                {TRIGGER_LABELS[workflow.trigger] || workflow.trigger}
              </code>{" "}
              · Branch:{" "}
              <code className="font-mono text-xs bg-surface/50 px-1.5 py-0.5 rounded">
                {workflow.branch}
              </code>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Total Runs</p>
          <p className="text-2xl font-bold text-text">{workflow._count.runs}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-emerald-500">
            {workflow._count.runs
              ? `${Math.round((successRuns / workflow.runs.length) * 100)}%`
              : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Avg. Duration</p>
          <p className="text-2xl font-bold text-text">{formatDuration(avgDuration)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Status</p>
          <p className="text-2xl font-bold text-text">
            {workflow.active ? "Active" : "Paused"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-8">
        <h2 className="text-lg font-semibold text-text mb-4">Pipeline</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface/30">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                  {i + 1}
                </span>
                <span className="text-sm text-text">{step}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted/50 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">Run History</h2>
        </div>
        {workflow.runs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <RotateCcw className="h-6 w-6 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No runs yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {workflow.runs.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {run.status === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : run.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                  )}
                  <div>
                    <span className="text-sm text-text">
                      {run.commitMsg || "Manual run"}
                    </span>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted">
                      {run.commitSha && (
                        <span className="font-mono">{run.commitSha.slice(0, 7)}</span>
                      )}
                      <span>{run.branch}</span>
                      <span>{formatDuration(run.duration)}</span>
                      <span>{new Date(run.startedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    run.status === "success"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : run.status === "failed"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {run.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
