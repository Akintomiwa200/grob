import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  TrendingUp,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Variable,
  Layers,
} from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;
  const userFilter = { project: { userId } };

  const [
    projectCount,
    deploymentCount,
    successCount,
    failedCount,
    buildingCount,
    domainCount,
    envVarCount,
    recentDeployments,
    projects,
  ] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.deployment.count({ where: userFilter }),
    prisma.deployment.count({ where: { ...userFilter, status: "success" } }),
    prisma.deployment.count({ where: { ...userFilter, status: "failed" } }),
    prisma.deployment.count({ where: { ...userFilter, status: "building" } }),
    prisma.domain.count({ where: userFilter }),
    prisma.envVar.count({ where: userFilter }),
    prisma.deployment.findMany({
      where: userFilter,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        status: true,
        createdAt: true,
        commitMsg: true,
        branch: true,
        project: { select: { name: true, slug: true } },
      },
    }),
    prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { deployments: true } },
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const successRate = deploymentCount
    ? Math.round((successCount / deploymentCount) * 100)
    : 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const prevSevenDays = new Date(now.getTime() - 14 * 86400000);

  const thisWeekDeploys = recentDeployments.filter(
    (d) => new Date(d.createdAt) >= sevenDaysAgo,
  );
  const lastWeekDeploys = recentDeployments.filter(
    (d) => new Date(d.createdAt) >= prevSevenDays && new Date(d.createdAt) < sevenDaysAgo,
  );
  const deployChange =
    lastWeekDeploys.length > 0
      ? Math.round(
          ((thisWeekDeploys.length - lastWeekDeploys.length) /
            lastWeekDeploys.length) *
            100,
        )
      : thisWeekDeploys.length > 0
        ? 100
        : 0;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const trafficData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 86400000);
    const dayStr = date.toISOString().slice(0, 10);
    const count = recentDeployments.filter((d) => {
      const dDate = new Date(d.createdAt).toISOString().slice(0, 10);
      return dDate === dayStr;
    }).length;
    return { day: dayNames[date.getDay()], deploys: count };
  });
  const maxDeploys = Math.max(...trafficData.map((d) => d.deploys), 1);

  const stats = [
    {
      label: "Total Projects",
      value: projectCount.toString(),
      icon: Layers,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Total Deployments",
      value: deploymentCount.toString(),
      change: `${deployChange >= 0 ? "+" : ""}${deployChange}%`,
      up: deployChange >= 0,
      icon: Rocket,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Success Rate",
      value: deploymentCount ? `${successRate}%` : "—",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Env Variables",
      value: envVarCount.toString(),
      icon: Variable,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  const recentActivity = recentDeployments.slice(0, 6).map((d) => {
    const diff = now.getTime() - new Date(d.createdAt).getTime();
    let time: string;
    if (diff < 3600000) time = `${Math.max(1, Math.floor(diff / 60000))}m ago`;
    else if (diff < 86400000) time = `${Math.floor(diff / 3600000)}h ago`;
    else time = `${Math.floor(diff / 86400000)}d ago`;

    return {
      project: d.project.name,
      msg: d.commitMsg || "Manual deploy",
      branch: d.branch || "main",
      status: d.status,
      time,
    };
  });

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Analytics</h1>
        <p className="text-muted text-sm mt-1">
          Workspace overview and deployment insights.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                </div>
                {"change" in stat && stat.change && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      "up" in stat && stat.up ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {"up" in stat && stat.up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-text">Deployment Activity</h2>
              <p className="text-xs text-muted mt-1">Deployments per day this week</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              {deployChange >= 0 ? "+" : ""}{deployChange}% vs last week
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {trafficData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-muted font-medium">
                  {d.deploys}
                </span>
                <div className="w-full relative group">
                  <div
                    className="w-full rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors"
                    style={{ height: `${Math.max(4, (d.deploys / maxDeploys) * 120)}px` }}
                  />
                </div>
                <span className="text-[10px] text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="font-semibold text-text mb-1">Workspace</h2>
          <p className="text-xs text-muted mb-6">Across all projects</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Projects</span>
              <span className="text-sm font-semibold text-text">{projectCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Deployments</span>
              <span className="text-sm font-semibold text-text">{deploymentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Success Rate</span>
              <span className="text-sm font-semibold text-emerald-500">
                {deploymentCount ? `${successRate}%` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Custom Domains</span>
              <span className="text-sm font-semibold text-text">{domainCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Env Variables</span>
              <span className="text-sm font-semibold text-text">{envVarCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="font-semibold text-text mb-4">Projects</h2>
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-sm text-muted">No projects yet</p>
            ) : (
              projects.map((p) => {
                const latest = p.deployments[0];
                const status = latest?.status || "pending";
                const statusColors: Record<string, string> = {
                  success: "bg-emerald-500",
                  failed: "bg-red-500",
                  building: "bg-blue-500 animate-pulse",
                  pending: "bg-zinc-500",
                };
                return (
                  <div key={p.id} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${statusColors[status] || "bg-zinc-500"}`} />
                        <span className="text-sm font-medium text-text">{p.name}</span>
                      </div>
                      <span className="text-xs text-muted">
                        {p._count.deployments} deploy{p._count.deployments !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent/60 rounded-full"
                        style={{
                          width: `${deploymentCount ? Math.round((p._count.deployments / deploymentCount) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="font-semibold text-text mb-4">Build Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-text">Successful</span>
              </div>
              <span className="text-sm font-semibold text-emerald-500">{successCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-text">Failed</span>
              </div>
              <span className="text-sm font-semibold text-red-500">{failedCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-text">Building</span>
              </div>
              <span className="text-sm font-semibold text-blue-500">{buildingCount}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-accent" />
                <span className="text-sm text-text">Total</span>
              </div>
              <span className="text-sm font-semibold text-text">{deploymentCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <h2 className="font-semibold text-text mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted">No recent activity</p>
          ) : (
            recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.status === "success"
                        ? "bg-emerald-500"
                        : activity.status === "failed"
                          ? "bg-red-500"
                          : activity.status === "building"
                            ? "bg-blue-500 animate-pulse"
                            : "bg-zinc-500"
                    }`}
                  />
                  <div>
                    <span className="text-sm text-text">{activity.msg}</span>
                    <span className="text-xs text-muted ml-2">
                      {activity.project} · {activity.branch}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted whitespace-nowrap ml-4">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
