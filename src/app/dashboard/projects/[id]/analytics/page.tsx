import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  GitBranch,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { LiveRefresh } from "../LiveRefresh";

export default async function AnalyticsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { deployments: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  const hasActiveDeploy = project.deployments.some(
    (d) => d.status === "building" || d.status === "pending",
  );

  const deployments = project.deployments;
  const total = deployments.length;
  const successCount = deployments.filter((d) => d.status === "success").length;
  const failedCount = deployments.filter((d) => d.status === "failed").length;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentDeployments = deployments.filter(
    (d) => new Date(d.createdAt) >= thirtyDaysAgo
  );
  const avgPerDay = +(recentDeployments.length / 30).toFixed(1);

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const count = deployments.filter((d) => {
      const dDate = new Date(d.createdAt);
      return dDate >= date && dDate < nextDay;
    }).length;
    return {
      label: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      count,
    };
  });
  const maxBarCount = Math.max(...last14Days.map((d) => d.count), 1);

  const branchMap = new Map<string, { total: number; success: number }>();
  for (const dep of deployments) {
    const branch = dep.branch || "main";
    const entry = branchMap.get(branch) || { total: 0, success: 0 };
    entry.total++;
    if (dep.status === "success") entry.success++;
    branchMap.set(branch, entry);
  }
  const branchStats = Array.from(branchMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  return (
    <div className="max-w-6xl space-y-6">
      <LiveRefresh active={hasActiveDeploy} />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">Analytics</h2>
          <p className="text-muted text-sm">
            Deployment analytics for{" "}
            <span className="text-text font-medium">{project.name}</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-accent" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-border rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted" />
            <p className="text-xs text-muted">Total Deployments</p>
          </div>
          <p className="text-2xl font-bold text-text">{total}</p>
        </div>
        <div className="border border-border rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <p className="text-xs text-muted">Success Rate</p>
          </div>
          <p className="text-2xl font-bold text-success">{successRate}%</p>
        </div>
        <div className="border border-border rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-error" />
            <p className="text-xs text-muted">Failed</p>
          </div>
          <p className="text-2xl font-bold text-error">{failedCount}</p>
        </div>
        <div className="border border-border rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-info" />
            <p className="text-xs text-muted">Avg / Day (30d)</p>
          </div>
          <p className="text-2xl font-bold text-info">{avgPerDay}</p>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-5">
        <h3 className="text-sm font-semibold text-text mb-4">
          Deployments per Day (Last 14 Days)
        </h3>
        {total === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted text-sm">
            No deployment data yet.
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-48">
            {last14Days.map((day, i) => {
              const height =
                day.count > 0
                  ? Math.max((day.count / maxBarCount) * 100, 8)
                  : 0;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  {day.count > 0 && (
                    <span className="text-[10px] text-muted font-medium">
                      {day.count}
                    </span>
                  )}
                  <div className="w-full relative group">
                    <div
                      className="w-full rounded-t-md bg-accent/80 hover:bg-accent transition-colors min-h-[2px]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted mt-1 hidden sm:block">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border border-border rounded-xl bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-text">
            Breakdown by Branch
          </h3>
        </div>
        {branchStats.length === 0 ? (
          <p className="text-muted text-sm">No branch data available.</p>
        ) : (
          <div className="space-y-3">
            {branchStats.map(([branch, stats]) => {
              const branchSuccessRate =
                stats.total > 0
                  ? Math.round((stats.success / stats.total) * 100)
                  : 0;
              return (
                <div key={branch}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-text font-mono">
                      {branch}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>
                        {stats.total} deployment{stats.total !== 1 ? "s" : ""}
                      </span>
                      <span
                        className={
                          branchSuccessRate >= 80
                            ? "text-success"
                            : branchSuccessRate >= 50
                              ? "text-yellow-500"
                              : "text-error"
                        }
                      >
                        {branchSuccessRate}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        branchSuccessRate >= 80
                          ? "bg-success"
                          : branchSuccessRate >= 50
                            ? "bg-yellow-500"
                            : "bg-error"
                      }`}
                      style={{ width: `${branchSuccessRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
