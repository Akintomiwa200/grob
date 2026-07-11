import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Gauge } from "lucide-react";
import Link from "next/link";

export default async function SpeedInsightsProjectPage(props: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { projectId } = await props.params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) notFound();

  const deployments = await prisma.deployment.findMany({
    where: { projectId, status: "success" },
    orderBy: { createdAt: "desc" },
  });

  const buildTimes = deployments.map((d) => (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) / 1000);
  const avg = buildTimes.length ? Math.round(buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length) : 0;
  const fastest = buildTimes.length ? Math.round(Math.min(...buildTimes)) : 0;
  const slowest = buildTimes.length ? Math.round(Math.max(...buildTimes)) : 0;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/speed-insights" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Speed Insights
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-text">{project.name}</h1>
        <p className="text-muted text-sm mt-1">Build performance for this project.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <p className="text-2xl font-bold text-text">{fmtDur(avg)}</p>
          <p className="text-xs text-muted mt-1">Avg Build Time</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <p className="text-2xl font-bold text-emerald-500">{fmtDur(fastest)}</p>
          <p className="text-xs text-muted mt-1">Fastest</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <p className="text-2xl font-bold text-amber-500">{fmtDur(slowest)}</p>
          <p className="text-xs text-muted mt-1">Slowest</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <p className="text-2xl font-bold text-text">{buildTimes.length}</p>
          <p className="text-xs text-muted mt-1">Builds Measured</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">Recent Build Times</h2>
        </div>
        {deployments.length > 0 ? (
          <div className="divide-y divide-border">
            {deployments.slice(0, 10).map((dep) => {
              const dur = (new Date(dep.updatedAt).getTime() - new Date(dep.createdAt).getTime()) / 1000;
              return (
                <div key={dep.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-mono text-text">{dep.commitSha?.slice(0, 7) || "—"}</span>
                    <span className="text-xs text-muted">{dep.branch}</span>
                  </div>
                  <span className="text-sm font-medium text-text">{fmtDur(dur)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Gauge className="h-6 w-6 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No successful builds yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function fmtDur(s: number): string {
  if (!s) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}
