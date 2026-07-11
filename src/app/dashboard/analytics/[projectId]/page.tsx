import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, CheckCircle2, XCircle, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function AnalyticsProjectPage(props: { params: Promise<{ projectId: string }> }) {
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
  });

  const successCount = deployments.filter((d) => d.status === "success").length;
  const failedCount = deployments.filter((d) => d.status === "failed").length;
  const domainCount = await prisma.domain.count({ where: { projectId } });

  const last7days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0); return d;
  });
  const dailyDeploys = last7days.map((day) => {
    const next = new Date(day); next.setDate(next.getDate() + 1);
    return { day: day.toLocaleDateString("en-US", { weekday: "short" }), count: deployments.filter((dep) => dep.createdAt >= day && dep.createdAt < next).length };
  });
  const maxDeploys = Math.max(...dailyDeploys.map((d) => d.count), 1);

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/analytics" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Analytics
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-text">{project.name}</h1>
        <p className="text-muted text-sm mt-1">Analytics overview for this project.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <p className="text-2xl font-bold text-text">{deployments.length}</p>
          <p className="text-xs text-muted mt-1">Total Deployments</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <p className="text-2xl font-bold text-emerald-500">{deployments.length ? Math.round((successCount / deployments.length) * 100) : 0}%</p>
          <p className="text-xs text-muted mt-1">Success Rate</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <p className="text-2xl font-bold text-text">{domainCount}</p>
          <p className="text-xs text-muted mt-1">Domains</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <p className="text-2xl font-bold text-text">1</p>
          <p className="text-xs text-muted mt-1">Environments</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-8">
        <h2 className="text-lg font-semibold text-text mb-4">Deployment Activity (7 days)</h2>
        <div className="flex items-end gap-2 h-40">
          {dailyDeploys.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-muted font-medium">{d.count}</span>
              <div className="w-full rounded-t-md bg-accent/20 border border-accent/30" style={{ height: `${(d.count / maxDeploys) * 100}px`, minHeight: d.count > 0 ? "4px" : "2px" }} />
              <span className="text-xs text-muted">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">All Deployments</h2>
        </div>
        {deployments.length > 0 ? (
          <div className="divide-y divide-border">
            {deployments.slice(0, 15).map((dep) => (
              <Link key={dep.id} href={`/dashboard/projects/${project.id}/deployments/${dep.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  {dep.status === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : dep.status === "failed" ? <XCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                  <span className="text-sm text-text font-mono">{dep.commitSha?.slice(0, 7) || "—"}</span>
                  <span className="text-xs text-muted hidden sm:inline">{dep.branch}</span>
                </div>
                <span className="text-xs text-muted">{formatRelativeTime(dep.createdAt)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <BarChart3 className="h-6 w-6 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No deployments yet.</p>
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
  return `${Math.floor(hours / 24)}d ago`;
}
