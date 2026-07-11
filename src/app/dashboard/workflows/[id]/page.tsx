import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Workflow, ArrowLeft, Play, Pause, Trash2, CheckCircle2, XCircle, Clock, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function WorkflowDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  const workflows: Record<string, { name: string; trigger: string; steps: string[]; status: string }> = {
    deploy: { name: "Deploy Pipeline", trigger: "Push to main", steps: ["Install dependencies", "Run build", "Run tests", "Deploy"], status: "active" },
    preview: { name: "Preview Deployments", trigger: "Pull request opened", steps: ["Install dependencies", "Run build", "Create preview URL"], status: "active" },
    cleanup: { name: "Branch Cleanup", trigger: "Pull request closed", steps: ["Find orphaned previews", "Delete preview deployments"], status: "active" },
    cron: { name: "Health Check", trigger: "Cron: every 5 minutes", steps: ["Ping endpoints", "Check response codes", "Alert on failure"], status: "paused" },
  };

  const wf = workflows[id] || { name: `Workflow ${id.slice(0, 6)}`, trigger: "Manual", steps: ["Step 1"], status: "active" };

  const deployments = await prisma.deployment.findMany({
    where: { project: { userId: session.user.id } },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/workflows" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Workflows
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text">{wf.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${wf.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>{wf.status}</span>
            </div>
            <p className="text-muted text-sm mt-1">Trigger: <code className="font-mono text-xs bg-surface/50 px-1.5 py-0.5 rounded">{wf.trigger}</code></p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-1.5"><Play className="h-4 w-4" /> Run Now</button>
            <button className="px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-8">
        <h2 className="text-lg font-semibold text-text mb-4">Pipeline</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {wf.steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface/30">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">{i + 1}</span>
                <span className="text-sm text-text">{step}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              {i < wf.steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted/50 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Configuration</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-text mb-1">Workflow Name</label><input defaultValue={wf.name} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" /></div>
            <div><label className="block text-sm font-medium text-text mb-1">Trigger</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>Push to branch</option><option>Pull request</option><option>Schedule (cron)</option><option>Manual</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-text mb-1">Branch Filter</label><input defaultValue="main" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" /></div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Save Configuration</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface/30"><h2 className="font-semibold text-text">Run History</h2></div>
          {deployments.length > 0 ? (
            <div className="divide-y divide-border">
              {deployments.slice(0, 6).map((dep) => (
                <Link key={dep.id} href={`/dashboard/projects/${dep.projectId}/deployments/${dep.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    {dep.status === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : dep.status === "failed" ? <XCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                    <span className="text-sm text-text">{dep.project.name}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted group-hover:text-text transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center"><p className="text-sm text-muted">No runs yet.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
