import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  AlertTriangle,
  Timer,
  Layers,
  ArrowRight,
  Rocket,
  FolderOpen,
} from "lucide-react";

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatDuration(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return `${mins}m ${remSecs}s`;
}

export default async function ObservabilityPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [projects, allRecentDeploys, failedDeploys, projectsWithRecentDeploys] =
    await Promise.all([
      prisma.project.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          slug: true,
          framework: true,
          _count: { select: { deployments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.deployment.findMany({
        where: {
          project: { userId },
          createdAt: { gte: thirtyDaysAgo },
        },
        include: { project: { select: { name: true, id: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.deployment.findMany({
        where: {
          project: { userId },
          status: "failed",
          createdAt: { gte: thirtyDaysAgo },
        },
        include: { project: { select: { name: true, id: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.project.findMany({
        where: {
          userId,
          deployments: {
            some: { createdAt: { gte: sevenDaysAgo } },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          deployments: {
            where: { createdAt: { gte: sevenDaysAgo } },
            orderBy: { createdAt: "desc" },
            select: { status: true, createdAt: true, updatedAt: true },
          },
        },
      }),
    ]);

  // ── Derived metrics ──────────────────────────────────────────
  const total = allRecentDeploys.length;
  const succeeded = allRecentDeploys.filter((d) => d.status === "success").length;
  const failed = allRecentDeploys.filter((d) => d.status === "failed").length;
  const building = allRecentDeploys.filter((d) => d.status === "building" || d.status === "pending").length;

  const successRate = total > 0 ? Math.round((succeeded / total) * 100) : 0;
  const failureRate = total > 0 ? Math.round((failed / total) * 100) : 0;

  // Build duration
  const buildDurations = allRecentDeploys
    .filter((d) => d.status === "success")
    .map((d) => new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime());

  const avgBuildTime =
    buildDurations.length > 0
      ? buildDurations.reduce((a, b) => a + b, 0) / buildDurations.length
      : 0;

  // Status determination
  function getStatus(rate: number, threshold: number) {
    if (rate >= threshold) return "healthy";
    if (rate >= threshold - 15) return "degraded";
    return "critical";
  }

  const overallStatus =
    successRate >= 90 ? "healthy" : successRate >= 70 ? "degraded" : "critical";

  // Health metric cards — all real
  const healthMetrics = [
    {
      label: "Success Rate (30d)",
      value: total > 0 ? `${successRate}%` : "—",
      status: getStatus(successRate, 90),
      icon: CheckCircle2,
    },
    {
      label: "Failed Deploys (30d)",
      value: String(failed),
      status: failed === 0 ? "healthy" : failed <= 3 ? "degraded" : "critical",
      icon: AlertTriangle,
    },
    {
      label: "Avg. Build Time",
      value: avgBuildTime > 0 ? formatDuration(avgBuildTime) : "—",
      status: avgBuildTime === 0
        ? "healthy"
        : avgBuildTime < 60000
          ? "healthy"
          : avgBuildTime < 180000
            ? "degraded"
            : "critical",
      icon: Timer,
    },
    {
      label: "Active Projects (7d)",
      value: String(projectsWithRecentDeploys.length),
      status: projectsWithRecentDeploys.length > 0 ? "healthy" : "degraded",
      icon: FolderOpen,
    },
  ];

  const statusStyles: Record<string, { dot: string; text: string; label: string }> = {
    healthy: { dot: "bg-emerald-500", text: "text-emerald-500", label: "Healthy" },
    degraded: { dot: "bg-amber-500", text: "text-amber-500", label: "Degraded" },
    critical: { dot: "bg-red-500", text: "text-red-500", label: "Critical" },
  };

  // Per-project health from real deploy data
  const projectHealth = projectsWithRecentDeploys.map((project) => {
    const deps = project.deployments;
    const pTotal = deps.length;
    const pSucceeded = deps.filter((d) => d.status === "success").length;
    const pFailed = deps.filter((d) => d.status === "failed").length;
    const pRate = pTotal > 0 ? Math.round((pSucceeded / pTotal) * 100) : 0;

    const durations = deps
      .filter((d) => d.status === "success")
      .map((d) => new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime());
    const pAvgBuild =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    const lastDep = deps[0];

    return {
      id: project.id,
      name: project.name,
      total: pTotal,
      succeeded: pSucceeded,
      failed: pFailed,
      successRate: pRate,
      avgBuildTime: pAvgBuild,
      status: getStatus(pRate, 90),
      lastDepStatus: lastDep?.status || "pending",
      lastDepTime: lastDep?.createdAt,
    };
  });

  // Build failed deploy as "incidents" with real timing
  const incidents = failedDeploys.map((dep) => {
    const duration = new Date(dep.updatedAt).getTime() - new Date(dep.createdAt).getTime();
    return {
      id: dep.id,
      projectId: dep.project.id,
      projectName: dep.project.name,
      commitMsg: dep.commitMsg || "Deploy failed",
      branch: dep.branch || "main",
      duration: formatDuration(duration),
      time: dep.createdAt,
      timeAgo: formatRelativeTime(dep.createdAt),
    };
  });

  const hasProjects = projects.length > 0;
  const hasDeploys = total > 0;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Observability</h1>
        <p className="text-muted text-sm mt-1">
          {hasDeploys
            ? `Real deployment health across ${projects.length} project${projects.length !== 1 ? "s" : ""} — last 30 days.`
            : "Deploy a project to start monitoring build health."}
        </p>
      </div>

      {!hasProjects ? (
        <div className="rounded-xl border border-border bg-surface/20 p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mx-auto mb-4">
            <Activity className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-text mb-2">No projects yet</h2>
          <p className="text-sm text-muted max-w-sm mx-auto mb-6">
            Create a project and deploy it to start monitoring build health and error rates.
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
          {/* Health Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {healthMetrics.map((metric) => {
              const Icon = metric.icon;
              const style = statusStyles[metric.status];
              return (
                <div key={metric.label} className="rounded-xl border border-border bg-surface/20 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.text === "text-emerald-500" ? "bg-emerald-500/10" : style.text === "text-amber-500" ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                      <Icon className={`h-5 w-5 ${style.text}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${style.dot}`} />
                      <span className={`text-[10px] font-medium ${style.text}`}>{style.label}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-text">{metric.value}</p>
                  <p className="text-xs text-muted mt-1">{metric.label}</p>
                </div>
              );
            })}
          </div>

          {/* Project Health Table */}
          {projectHealth.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text">Project Health</h2>
                <span className="text-xs text-muted">{projectHealth.length} active project{projectHealth.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface/50 text-muted">
                    <tr>
                      <th className="px-6 py-3 font-medium">Project</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium hidden sm:table-cell">Success Rate</th>
                      <th className="px-6 py-3 font-medium hidden md:table-cell">Avg. Build</th>
                      <th className="px-6 py-3 font-medium hidden md:table-cell">Deploys (7d)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projectHealth.map((project) => {
                      const style = statusStyles[project.status];
                      return (
                        <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3">
                            <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-3 hover:text-accent transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-surface/80 flex items-center justify-center text-[10px] font-medium text-text">
                                {project.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-text">{project.name}</span>
                            </Link>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${style.dot}`} />
                              <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 hidden sm:table-cell">
                            <span className={`text-xs font-medium ${
                              project.successRate >= 90 ? "text-emerald-500" : project.successRate >= 70 ? "text-amber-500" : "text-red-500"
                            }`}>
                              {project.successRate}%
                            </span>
                          </td>
                          <td className="px-6 py-3 hidden md:table-cell text-muted text-xs">
                            {project.avgBuildTime > 0 ? formatDuration(project.avgBuildTime) : "—"}
                          </td>
                          <td className="px-6 py-3 hidden md:table-cell text-muted text-xs">
                            {project.total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Incidents + Deployment Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Failed Deployments as Incidents */}
            <div className="rounded-xl border border-border bg-surface/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text">Recent Failures</h2>
                <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded-full">
                  {incidents.length} in 30d
                </span>
              </div>
              {incidents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 mx-auto mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-sm text-text font-medium">No failures</p>
                  <p className="text-xs text-muted mt-1">All deployments succeeded in the last 30 days</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {incidents.map((incident) => (
                    <Link
                      key={incident.id}
                      href={`/dashboard/projects/${incident.projectId}/deployments/${incident.id}`}
                      className="rounded-lg border border-border p-3 hover:bg-white/[0.02] transition-colors block"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">{incident.commitMsg}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                              failed
                            </span>
                            <span className="text-xs text-muted">{incident.projectName}</span>
                            <span className="text-xs text-muted font-mono">{incident.branch}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted whitespace-nowrap">{incident.timeAgo}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Deployment Health */}
            <div className="rounded-xl border border-border bg-surface/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text">Deployment Health</h2>
                <Link
                  href="/dashboard/deployments"
                  className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-500">{succeeded}</p>
                  <p className="text-xs text-muted mt-1">Succeeded</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-2xl font-bold text-red-500">{failed}</p>
                  <p className="text-xs text-muted mt-1">Failed</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 border border-border">
                  <p className="text-2xl font-bold text-text">{total}</p>
                  <p className="text-xs text-muted mt-1">Total</p>
                </div>
              </div>
              <div className="space-y-2">
                {allRecentDeploys.slice(0, 6).map((dep) => (
                  <Link
                    key={dep.id}
                    href={`/dashboard/projects/${dep.project.id}/deployments/${dep.id}`}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {dep.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : dep.status === "failed" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : dep.status === "building" ? (
                        <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm text-text">{dep.project.name}</span>
                    </div>
                    <span className="text-xs text-muted">{formatRelativeTime(dep.createdAt)}</span>
                  </Link>
                ))}
                {allRecentDeploys.length === 0 && (
                  <div className="text-center py-6">
                    <Rocket className="h-5 w-5 text-muted mx-auto mb-2" />
                    <p className="text-xs text-muted">No deployments in the last 30 days</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tracing CTA */}
          <div className="rounded-xl border border-border bg-surface/20 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 shrink-0">
                <Layers className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">Enable Detailed Tracing</h3>
                <p className="text-sm text-muted">
                  Add distributed tracing to get deeper insights into request flows across your services. Available on Pro plan and above.
                </p>
              </div>
              <button className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
                Enable
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
