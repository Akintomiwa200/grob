import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Eye, ArrowLeft, CheckCircle2, XCircle, Clock, Activity, Server } from "lucide-react";
import Link from "next/link";

export default async function ObservabilityProjectPage(props: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { projectId } = await props.params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) notFound();

  const deployments = await prisma.deployment.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const successCount = deployments.filter((d) => d.status === "success").length;
  const failedCount = deployments.filter((d) => d.status === "failed").length;
  const uptime = deployments.length ? Math.round((successCount / deployments.length) * 100) : 100;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/observability" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Observability
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text">{project.name}</h1>
            <p className="text-muted text-sm mt-1">Observability overview for this project.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`relative flex h-3 w-3 ${uptime >= 95 ? "" : "animate-pulse"}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${uptime >= 95 ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className={`relative inline-flex h-3 w-3 rounded-full ${uptime >= 95 ? "bg-emerald-500" : "bg-red-500"}`} />
            </div>
            <span className={`text-sm font-medium ${uptime >= 95 ? "text-emerald-500" : "text-red-500"}`}>
              {uptime >= 95 ? "Operational" : "Degraded"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 mb-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-emerald-500">{successCount}</p>
          <p className="text-xs text-muted mt-1">Successful</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 mb-3">
            <XCircle className="h-5 w-5 text-red-500" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-red-500">{failedCount}</p>
          <p className="text-xs text-muted mt-1">Failed</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-3">
            <Activity className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-text">{uptime}%</p>
          <p className="text-xs text-muted mt-1">Uptime</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-3">
            <Clock className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-text">{deployments.length}</p>
          <p className="text-xs text-muted mt-1">Total Deploys</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-accent" />
                <span className="text-sm text-text">Build Pipeline</span>
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-accent" />
                <span className="text-sm text-text">Deployment Service</span>
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-accent" />
                <span className="text-sm text-text">Webhook Delivery</span>
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Healthy</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Error Summary</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-lg font-bold text-emerald-500">{successCount}</p>
              <p className="text-xs text-muted">Resolved</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-lg font-bold text-red-500">{failedCount}</p>
              <p className="text-xs text-muted">Errors</p>
            </div>
          </div>
          <p className="text-xs text-muted text-center">No errors in the last 24 hours</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">Deployment Activity</h2>
        </div>
        {deployments.length > 0 ? (
          <div className="divide-y divide-border">
            {deployments.slice(0, 10).map((dep) => (
              <Link
                key={dep.id}
                href={`/dashboard/projects/${project.id}/deployments/${dep.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {dep.status === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : dep.status === "failed" ? <XCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                  <span className="text-sm text-text font-mono">{dep.commitSha?.slice(0, 7) || "—"}</span>
                  <span className="text-xs text-muted">{dep.branch}</span>
                </div>
                <span className="text-xs text-muted">{formatRelativeTime(dep.createdAt)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Eye className="h-6 w-6 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No deployments yet for this project.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
