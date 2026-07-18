import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Globe2,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Rocket,
} from "lucide-react";

export default async function SpeedInsightsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const prevSevenDays = new Date();
  prevSevenDays.setDate(prevSevenDays.getDate() - 14);

  const [
    projects,
    recentDeployments,
    thisWeekDeploys,
    lastWeekDeploys,
  ] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      include: {
        _count: { select: { deployments: true } },
        deployments: {
          where: { status: { in: ["success", "failed"] } },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            status: true,
            createdAt: true,
            updatedAt: true,
            branch: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deployment.findMany({
      where: {
        project: { userId },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        commitMsg: true,
        branch: true,
        projectId: true,
        project: { select: { name: true, slug: true } },
      },
    }),
    prisma.deployment.findMany({
      where: {
        project: { userId },
        createdAt: { gte: sevenDaysAgo },
        status: { in: ["success", "failed"] },
      },
      select: { status: true, createdAt: true, updatedAt: true },
    }),
    prisma.deployment.findMany({
      where: {
        project: { userId },
        createdAt: { gte: prevSevenDays, lt: sevenDaysAgo },
        status: { in: ["success", "failed"] },
      },
      select: { status: true, createdAt: true, updatedAt: true },
    }),
  ]);

  // ── Derived metrics ──────────────────────────────────────────
  const totalDeploys = recentDeployments.length;
  const succeeded = recentDeployments.filter((d) => d.status === "success").length;
  const failed = recentDeployments.filter((d) => d.status === "failed").length;
  const successRate = totalDeploys > 0 ? Math.round((succeeded / totalDeploys) * 100) : 0;

  // Build duration in seconds (updatedAt - createdAt for successful builds)
  const buildDurations = recentDeployments
    .filter((d) => d.status === "success")
    .map((d) => (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) / 1000);

  const avgBuildTime = buildDurations.length > 0
    ? buildDurations.reduce((a, b) => a + b, 0) / buildDurations.length
    : 0;

  const p95BuildTime = buildDurations.length > 0
    ? buildDurations.sort((a, b) => a - b)[Math.floor(buildDurations.length * 0.95)]
    : 0;

  // Deploy frequency (deploys per week in last 30 days ≈ 4.3 weeks)
  const weeksInPeriod = 30 / 7;
  const deployFrequency = Math.round(totalDeploys / weeksInPeriod);

  // Week-over-week change
  const thisWeekCount = thisWeekDeploys.length;
  const lastWeekCount = lastWeekDeploys.length;
  const weekChange = lastWeekCount > 0
    ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
    : thisWeekCount > 0 ? 100 : 0;

  const thisWeekSuccess = thisWeekDeploys.filter((d) => d.status === "success").length;
  const lastWeekSuccess = lastWeekDeploys.filter((d) => d.status === "success").length;

  // ── Performance metric cards ─────────────────────────────────
  const performanceMetrics = [
    {
      label: "Avg. Build Time",
      value: avgBuildTime > 0 ? `${avgBuildTime.toFixed(1)}s` : "—",
      change: weekChange >= 0 ? `+${thisWeekCount}` : `${thisWeekCount}`,
      up: true,
      icon: Timer,
      desc: "Successful build duration (30d avg)",
    },
    {
      label: "Deploy Frequency",
      value: deployFrequency > 0 ? `${deployFrequency}/wk` : "0/wk",
      change: `${weekChange >= 0 ? "+" : ""}${weekChange}%`,
      up: weekChange >= 0,
      icon: Rocket,
      desc: "Average deploys per week",
    },
    {
      label: "Success Rate",
      value: totalDeploys > 0 ? `${successRate}%` : "—",
      change: `${succeeded}✓ ${failed > 0 ? `${failed}✗` : ""}`,
      up: successRate >= 80,
      icon: CheckCircle2,
      desc: "Build success rate (30d)",
    },
    {
      label: "P95 Build Time",
      value: p95BuildTime > 0 ? `${p95BuildTime.toFixed(1)}s` : "—",
      change: `${buildDurations.length} builds`,
      up: true,
      icon: Clock,
      desc: "95th percentile build duration",
    },
  ];

  // ── Build health vitals (derived from real data) ─────────────
  const vitals = [
    {
      name: "Success Rate",
      abbr: "SR",
      value: `${successRate}%`,
      target: "≥ 95%",
      score: Math.min(100, successRate),
      bg: successRate >= 95 ? "bg-emerald-500" : successRate >= 80 ? "bg-amber-500" : "bg-red-500",
      description: "Percentage of successful deployments in the last 30 days",
    },
    {
      name: "Avg. Build Speed",
      abbr: "BSP",
      value: avgBuildTime > 0 ? `${avgBuildTime.toFixed(1)}s` : "N/A",
      target: "< 60s",
      score: avgBuildTime === 0 ? 0 : Math.min(100, Math.max(0, Math.round(100 - (avgBuildTime - 10) * 1.5))),
      bg: avgBuildTime <= 30 ? "bg-emerald-500" : avgBuildTime <= 90 ? "bg-amber-500" : "bg-red-500",
      description: "Average time from push to production (successful builds)",
    },
    {
      name: "P95 Build Speed",
      abbr: "P95",
      value: p95BuildTime > 0 ? `${p95BuildTime.toFixed(1)}s` : "N/A",
      target: "< 120s",
      score: p95BuildTime === 0 ? 0 : Math.min(100, Math.max(0, Math.round(100 - (p95BuildTime - 20) * 1.2))),
      bg: p95BuildTime <= 60 ? "bg-emerald-500" : p95BuildTime <= 120 ? "bg-amber-500" : "bg-red-500",
      description: "95th percentile build time — worst-case experience",
    },
    {
      name: "Deploy Velocity",
      abbr: "DPL",
      value: `${deployFrequency}/wk`,
      target: "≥ 2/wk",
      score: Math.min(100, deployFrequency * 20),
      bg: deployFrequency >= 5 ? "bg-emerald-500" : deployFrequency >= 2 ? "bg-amber-500" : "bg-red-500",
      description: "Average number of deployments per week",
    },
    {
      name: "Failure Rate",
      abbr: "FLR",
      value: totalDeploys > 0 ? `${Math.round((failed / totalDeploys) * 100)}%` : "N/A",
      target: "< 5%",
      score: totalDeploys === 0 ? 0 : Math.min(100, Math.max(0, 100 - Math.round((failed / totalDeploys) * 200))),
      bg: failed === 0 ? "bg-emerald-500" : (failed / totalDeploys) <= 0.1 ? "bg-amber-500" : "bg-red-500",
      description: "Percentage of failed builds — lower is better",
    },
    {
      name: "Week-over-Week",
      abbr: "WoW",
      value: `${thisWeekCount}`,
      target: `vs ${lastWeekCount} last wk`,
      score: Math.min(100, lastWeekCount > 0 ? Math.round((thisWeekCount / Math.max(lastWeekCount, 1)) * 50) : (thisWeekCount > 0 ? 75 : 0)),
      bg: weekChange >= 0 ? "bg-emerald-500" : "bg-amber-500",
      description: "Deployment activity compared to the previous week",
    },
  ];

  // ── Monthly score history (last 6 months) ────────────────────
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const historicalScores = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    return {
      month: monthNames[d.getMonth()],
      // We don't have historical RUM data, but we derive from deployment activity
      // Score based on deploy count + success rate that month
      score: 0, // Will be populated per-project
      deployCount: 0,
    };
  });

  // ── Per-project performance ──────────────────────────────────
  const projectStats = projects.map((project) => {
    const deps = project.deployments;
    const total = deps.length;
    const successes = deps.filter((d) => d.status === "success").length;
    const rate = total > 0 ? Math.round((successes / total) * 100) : 0;

    const durations = deps
      .filter((d) => d.status === "success")
      .map((d) => (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) / 1000);

    const avg = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    // Health score: 60% success rate + 40% speed
    const speedScore = avg === 0 ? 50 : Math.min(100, Math.max(0, Math.round(100 - (avg - 10) * 1.5)));
    const healthScore = total === 0 ? 50 : Math.round(rate * 0.6 + speedScore * 0.4);

    return {
      id: project.id,
      name: project.name,
      deployments: total,
      successRate: rate,
      avgBuildTime: avg,
      healthScore,
    };
  });

  const hasProjects = projects.length > 0;
  const hasDeployments = totalDeploys > 0;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Speed Insights</h1>
        <p className="text-muted text-sm mt-1">
          {hasDeployments
            ? `Real build performance across ${projects.length} project${projects.length !== 1 ? "s" : ""} — last 30 days.`
            : "Deploy a project to see real build performance metrics."}
        </p>
      </div>

      {!hasDeployments ? (
        <div className="rounded-xl border border-border bg-surface/20 p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mx-auto mb-4">
            <Rocket className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-text mb-2">No deployments yet</h2>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            Deploy a project to start tracking build speed, success rates, and deployment health.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:brightness-110 transition-all"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {performanceMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-xl border border-border bg-surface/20 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] text-muted font-medium">{metric.desc}</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{metric.value}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted">{metric.label}</p>
                    <span className={`text-[10px] font-medium ${metric.up ? "text-emerald-500" : "text-amber-500"}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Build Health Vitals */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-text">Build Health</h2>
                <p className="text-xs text-muted mt-0.5">Derived from real deployment data (last 30 days)</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Good
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Needs Work
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Poor
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vitals.map((vital) => (
                <div key={vital.abbr} className="rounded-xl border border-border bg-surface/20 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted mb-0.5">{vital.name}</p>
                      <p className="text-lg font-bold text-text">{vital.abbr}</p>
                    </div>
                    <div className="relative h-14 w-14">
                      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-white/5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          strokeWidth="3"
                          strokeDasharray={`${vital.score}, 100`}
                          className={vital.bg}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text">
                        {vital.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-text">{vital.value}</span>
                    <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded-md">
                      Target: {vital.target}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-3">{vital.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Performance Table */}
          <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-surface/30">
              <h2 className="font-semibold text-text">Project Performance</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium hidden md:table-cell">Deploys</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Success</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Avg. Build</th>
                  <th className="px-6 py-3 font-medium">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projectStats.slice(0, 10).map((project) => (
                  <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-3 hover:text-accent transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-surface/80 flex items-center justify-center text-[10px] font-medium text-text">
                          {project.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-text">{project.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell text-muted">
                      {project.deployments}
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium ${
                        project.successRate >= 90 ? "text-emerald-500" : project.successRate >= 70 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {project.successRate}%
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium ${
                        project.avgBuildTime <= 30 ? "text-emerald-500" : project.avgBuildTime <= 90 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {project.avgBuildTime > 0 ? `${project.avgBuildTime.toFixed(1)}s` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.healthScore >= 80
                          ? "bg-emerald-500/10 text-emerald-500"
                          : project.healthScore >= 50
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-red-500/10 text-red-500"
                      }`}>
                        {project.healthScore}
                      </span>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-muted text-sm">No projects to analyze yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
