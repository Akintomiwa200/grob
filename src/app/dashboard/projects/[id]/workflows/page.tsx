import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  GitBranch,
  GitPullRequest,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

const WORKFLOWS = [
  {
    id: "wf-1",
    name: "CI/CD Pipeline",
    trigger: "push to main",
    triggerIcon: GitBranch,
    status: "success",
    runCount: 247,
    lastRun: "12 minutes ago",
    steps: [
      { name: "Install Dependencies", status: "success", duration: "32s" },
      { name: "Build", status: "success", duration: "1m 18s" },
      { name: "Deploy to Production", status: "success", duration: "45s" },
    ],
  },
  {
    id: "wf-2",
    name: "Preview Deploy",
    trigger: "PR opened",
    triggerIcon: GitPullRequest,
    status: "success",
    runCount: 89,
    lastRun: "2 hours ago",
    steps: [
      { name: "Build Preview", status: "success", duration: "54s" },
      { name: "Deploy Preview", status: "success", duration: "28s" },
    ],
  },
];

const STEP_STATUS: Record<
  string,
  { icon: typeof CheckCircle2; color: string; bg: string }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-green-500/10",
  },
  failed: { icon: XCircle, color: "text-error", bg: "bg-red-500/10" },
  running: { icon: Clock, color: "text-info", bg: "bg-blue-500/10" },
};

export default async function WorkflowsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">Workflows</h2>
          <p className="text-muted text-sm">
            Manage CI/CD workflows for{" "}
            <span className="text-text font-medium">{project.name}</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
          <Play className="w-4 h-4" />
          Run Workflow
        </button>
      </div>

      <div className="space-y-4">
        {WORKFLOWS.map((workflow) => {
          const TriggerIcon = workflow.triggerIcon;
          return (
            <div
              key={workflow.id}
              className="bg-surface border border-border rounded-xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                      <TriggerIcon className="w-5 h-5 text-muted" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-text">
                        {workflow.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-info">
                          {workflow.trigger}
                        </span>
                        <span className="text-[10px] text-muted">
                          {workflow.runCount} runs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">
                      Last run: {workflow.lastRun}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      <span className="text-[10px] font-semibold text-success uppercase">
                        Passed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="px-5 py-3">
                <div className="flex items-center gap-2">
                  {workflow.steps.map((step, i) => {
                    const stepStyle =
                      STEP_STATUS[step.status] || STEP_STATUS.success;
                    const StepIcon = stepStyle.icon;
                    return (
                      <div key={step.name} className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${stepStyle.bg}`}
                        >
                          <StepIcon className={`w-3.5 h-3.5 ${stepStyle.color}`} />
                          <span className="text-xs text-text font-medium">
                            {step.name}
                          </span>
                          <span className="text-[10px] text-muted">
                            {step.duration}
                          </span>
                        </div>
                        {i < workflow.steps.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-muted" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
        <RotateCcw className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted space-y-1">
          <p>
            Workflows are triggered automatically based on Git events. Each run
            creates an isolated execution environment.
          </p>
          <p>
            You can manually re-run any workflow from the deployments page.
          </p>
        </div>
      </div>
    </div>
  );
}
