"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  GitBranch,
  Trash2,
  FileCode,
} from "lucide-react";
import {
  createWorkflow,
  deleteWorkflow,
  triggerWorkflowRun,
  updateWorkflow,
} from "@/lib/workflow-actions";

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  branch: string;
  active: boolean;
  steps: string;
  _count: { runs: number };
  runs: {
    id: string;
    status: string;
    startedAt: string;
    duration: number | null;
  }[];
};

type Run = {
  id: string;
  status: string;
  branch: string;
  commitSha: string;
  commitMsg: string;
  duration: number | null;
  startedAt: string;
  workflow: { name: string };
};

type Stats = {
  workflowCount: number;
  totalRuns: number;
  successRate: number;
  avgDuration: number;
};

function formatDuration(ms: number | null) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const TRIGGER_LABELS: Record<string, string> = {
  push: "Push to branch",
  pr: "Pull request",
  schedule: "Scheduled",
  manual: "Manual",
};

export function WorkflowsClient({
  initialWorkflows,
  recentRuns,
  stats,
}: {
  initialWorkflows: Workflow[];
  recentRuns: Run[];
  stats: Stats;
}) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("push");
  const [newBranch, setNewBranch] = useState("main");

  async function handleCreate() {
    if (!newName) return;
    const wf = await createWorkflow(workflows[0]?.id ? "" : "", {
      name: newName,
      trigger: newTrigger,
      branch: newBranch,
    });
    if (wf) {
      setWorkflows((prev) => [
        { ...wf, _count: { runs: 0 }, runs: [] },
        ...prev,
      ]);
    }
    setShowNew(false);
    setNewName("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteWorkflow(id);
    setWorkflows((w) => w.filter((x) => x.id !== id));
  }

  async function handleTrigger(id: string) {
    await triggerWorkflowRun(id);
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    await updateWorkflow(id, { active: !active });
    setWorkflows((w) =>
      w.map((x) => (x.id === id ? { ...x, active: !active } : x))
    );
    router.refresh();
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Workflows",
            value: stats.workflowCount.toString(),
            icon: FileCode,
            color: "text-accent",
            bg: "bg-accent/10",
          },
          {
            label: "Success Rate",
            value: stats.totalRuns ? `${stats.successRate}%` : "—",
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Total Runs",
            value: stats.totalRuns.toLocaleString(),
            icon: Play,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Avg. Duration",
            value: formatDuration(stats.avgDuration),
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">Workflows</h2>
            <button
              onClick={() => setShowNew((s) => !s)}
              className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> New Workflow
            </button>
          </div>

          {showNew && (
            <div className="rounded-xl border border-border bg-surface/20 p-5 mb-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  placeholder="Workflow name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="push">Push to branch</option>
                  <option value="pr">Pull request</option>
                  <option value="schedule">Scheduled</option>
                  <option value="manual">Manual</option>
                </select>
                <input
                  placeholder="Branch"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {workflows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <FileCode className="h-8 w-8 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted">No workflows yet</p>
              </div>
            ) : (
              workflows.map((wf) => {
                let steps: string[] = [];
                try {
                  steps = JSON.parse(wf.steps);
                } catch {
                  steps = ["Build", "Deploy"];
                }
                const lastRun = wf.runs[0];
                return (
                  <div
                    key={wf.id}
                    className="rounded-xl border border-border bg-surface/20 p-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                          <FileCode className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/workflows/${wf.id}`}
                              className="font-semibold text-text hover:text-accent transition-colors"
                            >
                              {wf.name}
                            </Link>
                            <div className="flex items-center gap-1">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  wf.active ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              <span className="text-[10px] text-muted">
                                {wf.active ? "active" : "paused"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                            <span>Trigger: {TRIGGER_LABELS[wf.trigger] || wf.trigger}</span>
                            <span className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3" /> {wf.branch}
                            </span>
                            <span>{wf._count.runs} runs</span>
                            {lastRun && (
                              <span>Last: {timeAgo(lastRun.startedAt)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            {steps.map((step, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-surface/50 text-muted border border-border"
                              >
                                {step}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleTrigger(wf.id)}
                          disabled={!wf.active}
                          className="p-1.5 rounded-lg text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-30"
                          title="Run now"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(wf.id, wf.active)}
                          className="p-1.5 rounded-lg text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                          title={wf.active ? "Pause" : "Resume"}
                        >
                          {wf.active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(wf.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-4">Recent Runs</h2>
          <div className="rounded-xl border border-border bg-surface/20 divide-y divide-border">
            {recentRuns.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted">No runs yet</p>
              </div>
            ) : (
              recentRuns.map((run) => (
                <div key={run.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {run.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : run.status === "failed" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <RotateCcw className="h-4 w-4 text-blue-500 animate-spin" />
                      )}
                      <span className="text-sm font-medium text-text">
                        {run.workflow.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                    {run.commitSha && (
                      <span className="font-mono">{run.commitSha.slice(0, 7)}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" /> {run.branch}
                    </span>
                    <span>{formatDuration(run.duration)}</span>
                    <span>{timeAgo(run.startedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
