"use client";

import { useState } from "react";
import {
  Workflow,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  GitBranch,
  Settings,
  Trash2,
  MoreHorizontal,
  FileCode,
} from "lucide-react";

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  status: "active" | "paused" | "failed";
  lastRun: string;
  lastStatus: "success" | "failed" | "running";
  runs: number;
  avgDuration: string;
  branch: string;
};

export default function WorkflowsPage() {
  const workflows: Workflow[] = [
    {
      id: "1",
      name: "Deploy to Production",
      trigger: "push to main",
      status: "active",
      lastRun: "12 minutes ago",
      lastStatus: "success",
      runs: 342,
      avgDuration: "1m 24s",
      branch: "main",
    },
    {
      id: "2",
      name: "Preview Deployment",
      trigger: "pull request",
      status: "active",
      lastRun: "2 hours ago",
      lastStatus: "success",
      runs: 128,
      avgDuration: "58s",
      branch: "feature/*",
    },
    {
      id: "3",
      name: "Run E2E Tests",
      trigger: "push to main",
      status: "active",
      lastRun: "2 hours ago",
      lastStatus: "failed",
      runs: 89,
      avgDuration: "3m 12s",
      branch: "main",
    },
    {
      id: "4",
      name: "Build & Cache Dependencies",
      trigger: "schedule (daily)",
      status: "active",
      lastRun: "6 hours ago",
      lastStatus: "success",
      runs: 30,
      avgDuration: "2m 45s",
      branch: "main",
    },
    {
      id: "5",
      name: "Lighthouse Audit",
      trigger: "push to main",
      status: "paused",
      lastRun: "3 days ago",
      lastStatus: "success",
      runs: 15,
      avgDuration: "4m 02s",
      branch: "main",
    },
  ];

  const recentRuns = [
    { workflow: "Deploy to Production", status: "success", commit: "a8f2c1d", branch: "main", duration: "1m 18s", time: "12 min ago" },
    { workflow: "Preview Deployment", status: "success", commit: "b3k9e4f", branch: "feat/dark-mode", duration: "52s", time: "2 hours ago" },
    { workflow: "Run E2E Tests", status: "failed", commit: "c7m2p8q", branch: "main", duration: "2m 48s", time: "2 hours ago" },
    { workflow: "Deploy to Production", status: "success", commit: "d1n5r9s", branch: "main", duration: "1m 22s", time: "5 hours ago" },
    { workflow: "Build & Cache Dependencies", status: "success", commit: "e4t8u2v", branch: "main", duration: "2m 41s", time: "6 hours ago" },
  ];

  const statusIcon = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
    running: <RotateCcw className="h-4 w-4 text-blue-500 animate-spin" />,
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Workflows</h1>
          <p className="text-muted text-sm mt-1">
            Automate your CI/CD pipelines with configurable build and deployment workflows.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] self-start">
          <Plus className="h-4 w-4" /> New Workflow
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Workflow className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{workflows.length}</p>
          <p className="text-xs text-muted mt-1">Workflows</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">96.8%</p>
          <p className="text-xs text-muted mt-1">Success Rate</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Play className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">504</p>
          <p className="text-xs text-muted mt-1">Total Runs</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">1m 48s</p>
          <p className="text-xs text-muted mt-1">Avg. Duration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-text mb-4">Workflows</h2>
          <div className="space-y-3">
            {workflows.map((wf) => (
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
                        <h3 className="font-semibold text-text">{wf.name}</h3>
                        <div className="flex items-center gap-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              wf.status === "active"
                                ? "bg-emerald-500"
                                : wf.status === "paused"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-[10px] text-muted capitalize">{wf.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                        <span>Trigger: {wf.trigger}</span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" /> {wf.branch}
                        </span>
                        <span>{wf.runs} runs</span>
                        <span>Avg: {wf.avgDuration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-lg text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                      <Play className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-4">Recent Runs</h2>
          <div className="rounded-xl border border-border bg-surface/20 divide-y divide-border">
            {recentRuns.map((run, i) => (
              <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusIcon[run.status as keyof typeof statusIcon]}
                    <span className="text-sm font-medium text-text">{run.workflow}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                  <span className="font-mono">{run.commit}</span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" /> {run.branch}
                  </span>
                  <span>{run.duration}</span>
                  <span>{run.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
