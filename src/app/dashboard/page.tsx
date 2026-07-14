import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddNewButton from "@/components/AddNewButton";
import ProjectCardMenu from "@/components/ProjectCardMenu";
import { cleanupDuplicateProjects } from "./projects/new/actions";

function StatusDot({ status }: { status: string }) {
  if (status === "success")
    return <span className="w-2 h-2 rounded-full bg-success shrink-0" />;
  if (status === "failed")
    return <span className="w-2 h-2 rounded-full bg-error shrink-0" />;
  if (status === "building")
    return <span className="w-2 h-2 rounded-full bg-signal shrink-0 animate-pulse" />;
  return <span className="w-2 h-2 rounded-full bg-border shrink-0" />;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function extractRepoName(gitUrl: string): string {
  if (!gitUrl) return "";
  return gitUrl.replace("https://github.com/", "").replace(".git", "");
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const userName = session!.user?.name || session!.user?.email?.split("@")[0] || "U";

  await cleanupDuplicateProjects();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [projects, allDeployments, recentDeployments] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { deployments: true } },
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, branch: true, createdAt: true, commitMsg: true },
        },
      },
    }),
    prisma.deployment.findMany({
      where: {
        project: { userId },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { status: true, createdAt: true },
    }),
    prisma.deployment.findMany({
      where: { project: { userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        commitMsg: true,
        branch: true,
        project: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const totalDeploys = allDeployments.length;
  const succeeded = allDeployments.filter((d) => d.status === "success").length;
  const failed = allDeployments.filter((d) => d.status === "failed").length;
  const activeProjects = projects.length;
  const totalAllTime = projects.reduce((sum, p) => sum + p._count.deployments, 0);

  const usageStats = [
    { label: "Projects", value: formatCount(activeProjects), limit: "10" },
    { label: "Deployments (30d)", value: formatCount(totalDeploys), limit: "100" },
    { label: "Successful", value: formatCount(succeeded), limit: "-" },
    { label: "Failed", value: formatCount(failed), limit: "-" },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto text-text">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="relative flex-1 max-w-xl">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search Projects..."
            className="w-full pl-10 pr-4 py-2 bg-bg/50 border border-border rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <AddNewButton />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          {/* Usage */}
          <div>
            <h2 className="text-sm font-medium mb-4">Usage</h2>
            <div className="bg-bg/30 border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Last 30 days</span>
                <span className="text-[10px] text-muted px-2 py-0.5 rounded font-medium border border-border">
                  Free
                </span>
              </div>
              <div className="space-y-3 text-xs text-muted">
                {usageStats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`flex items-center justify-between ${
                      i < usageStats.length - 1 ? "border-b border-border/50 pb-2" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      {stat.label}
                    </div>
                    <span className="text-text">
                      {stat.value}{" "}
                      {stat.limit !== "-" && (
                        <span className="text-muted">/ {stat.limit}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div>
            <h2 className="text-sm font-medium mb-4">Alerts</h2>
            <div className="bg-bg/30 border border-border rounded-xl p-6 text-center">
              <h3 className="text-sm font-medium mb-1">
                Get alerted for anomalies
              </h3>
              <p className="text-xs text-muted mb-4">
                Automatically monitor your projects for anomalies and get notified.
              </p>
              <Link
                href="/dashboard/settings"
                className="text-xs font-medium text-white bg-accent hover:opacity-90 px-4 py-1.5 rounded-lg inline-block transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-sm font-medium mb-4">Recent Activity</h2>
            <div className="bg-bg/30 border border-border rounded-xl p-4 space-y-3">
              {recentDeployments.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">
                  No recent deployments
                </p>
              ) : (
                recentDeployments.map((dep) => (
                  <div key={dep.id} className="flex items-start gap-2">
                    <StatusDot status={dep.status} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text truncate">{dep.project.name}</p>
                      <p className="text-[10px] text-muted truncate">
                        {dep.commitMsg || dep.branch} &middot;{" "}
                        {new Date(dep.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Projects Grid) */}
        <div className="col-span-12 lg:col-span-9">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium">Projects</h2>
            <span className="text-xs text-muted">{projects.length} total</span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-bg/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface/50 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-1 text-text">No projects yet</h3>
              <p className="text-muted text-sm mb-4">Create your first project to get started</p>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
              >
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => {
                const latest = project.deployments[0];
                const repoName = extractRepoName(project.gitUrl);
                const initial = userName.charAt(0).toUpperCase();

                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="group block bg-bg/20 border border-border rounded-xl p-4 hover:border-border transition-all"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 truncate flex-1">
                        <div className="w-8 h-8 rounded-lg bg-surface/80 flex-shrink-0 flex items-center justify-center text-xs font-medium text-text">
                          {project.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <h3 className="text-sm font-medium truncate">{project.name}</h3>
                          <p className="text-[10px] text-muted truncate">
                            {project.slug}.localhost:3000
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {latest ? (
                          <StatusDot status={latest.status} />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-border" />
                        )}
                        <ProjectCardMenu
                          projectId={project.id}
                          projectName={project.name}
                          slug={project.slug}
                        />
                      </div>
                    </div>

                    {/* User/Git Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-full bg-surface flex items-center justify-center text-[8px] text-muted border border-border">
                        {initial}
                      </div>
                      <span className="text-[10px] text-muted font-medium truncate">
                        {repoName || project.name.toLowerCase().replace(/\s/g, "-")}
                      </span>
                    </div>

                    {/* Last Deployment Info */}
                    <div className="space-y-2">
                      <p className="text-sm text-text line-clamp-1">
                        {project.description || latest?.commitMsg || "No deployments yet"}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-muted">
                        <span className="flex items-center gap-1">
                          {latest ? (
                            <>
                              <StatusDot status={latest.status} />
                              <span>{latest.branch}</span>
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </span>
                        <span>
                          {latest
                            ? new Date(latest.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : new Date(project.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
