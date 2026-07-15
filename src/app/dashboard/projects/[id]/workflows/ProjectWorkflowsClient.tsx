"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  GitBranch,
  Plus,
  RotateCcw,
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

const TRIGGER_LABELS: Record<string, string> = {
  push: "Push to branch",
  pr: "Pull request",
  schedule: "Scheduled",
  manual: "Manual",
};

export function ProjectWorkflowsClient({
  projectId,
  workflows,
}: {
  projectId: string;
  workflows: Workflow[];
}) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("push");
  const [newBranch, setNewBranch] = useState("main");

  async function handleCreate() {
    if (!newName) return;
    await createWorkflow(projectId, {
      name: newName,
      trigger: newTrigger,
      branch: newBranch,
    });
    setShowNew(false);
    setNewName("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteWorkflow(id);
    router.refresh();
  }

  async function handleTrigger(id: string) {
    await triggerWorkflowRun(id);
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    await updateWorkflow(id, { active: !active });
    router.refresh();
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">Workflows</h2>
          <p className="text-muted text-sm">
            Manage CI/CD workflows and automation
          </p>
        </div>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition"
        >
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {showNew && (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder="Workflow name" value={newName} onChange={(e) => setNewName(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50" />
            <select value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50">
              <option value="push">Push to branch</option>
              <option value="pr">Pull request</option>
              <option value="schedule">Scheduled</option>
              <option value="manual">Manual</option>
            </select>
            <input placeholder="Branch" value={newBranch} onChange={(e) => setNewBranch(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90">Create</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:bg-white/[0.04]">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {workflows.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center">
            <RotateCcw className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No workflows yet</p>
            <p className="text-xs text-muted/60 mt-1">Create a workflow to automate your CI/CD pipeline</p>
          </div>
        ) : (
          workflows.map((workflow) => {
            let steps: string[] = [];
            try {
              steps = JSON.parse(workflow.steps);
            } catch {
              steps = ["Build", "Deploy"];
            }
            const lastRun = workflow.runs[0];
            const lastStatus = lastRun?.status;

            return (
              <div key={workflow.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-muted" />
                      </div>
                      <div>
                        <Link href={`/dashboard/workflows/${workflow.id}`} className="text-sm font-medium text-text hover:text-accent transition-colors">
                          {workflow.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                            {TRIGGER_LABELS[workflow.trigger] || workflow.trigger}
                          </span>
                          <span className="text-[10px] text-muted flex items-center gap-1">
                            <GitBranch className="h-2.5 w-2.5" /> {workflow.branch}
                          </span>
                          <span className="text-[10px] text-muted">
                            {workflow._count.runs} runs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lastRun && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border">
                          {lastStatus === "success" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span className="text-[10px] font-semibold text-emerald-500 uppercase">Passed</span>
                            </>
                          ) : lastStatus === "failed" ? (
                            <>
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span className="text-[10px] font-semibold text-red-500 uppercase">Failed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-semibold text-blue-500 uppercase">Running</span>
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTrigger(workflow.id)}
                          disabled={!workflow.active}
                          className="p-1.5 rounded-lg text-muted hover:text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30"
                          title="Run now"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(workflow.id, workflow.active)}
                          className="p-1.5 rounded-lg text-muted hover:text-amber-500 hover:bg-amber-500/10"
                          title={workflow.active ? "Pause" : "Resume"}
                        >
                          {workflow.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(workflow.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {steps.map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/50 border border-border">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs text-text font-medium">{step}</span>
                        </div>
                        {i < steps.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-muted" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
