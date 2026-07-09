import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddNewButton from "@/components/AddNewButton";

// Simple helper for the deployment status icon
const StatusIcon = ({ status }: { status: string }) => {
  if (status === "success")
    return (
      <div className="w-5 h-5 border border-green-500/50 rounded-full flex items-center justify-center text-[10px] text-green-500">
        ✓
      </div>
    );
  if (status === "failed")
    return (
      <div className="w-5 h-5 border border-red-500/50 rounded-full flex items-center justify-center text-[10px] text-red-500">
        ✕
      </div>
    );
  return (
    <div className="w-5 h-5 border border-border rounded-full flex items-center justify-center text-[10px] text-muted">
      ~
    </div>
  );
};

export default async function DashboardPage() {
  const session = await auth();

  // Fetch projects with deployment counts
  const projects = await prisma.project.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deployments: true } } },
  });

  // Fetch stats for the usage panel (You can expand this logic to pull real 30-day data)
  const totalDeployments = projects.reduce(
    (sum, p) => sum + p._count.deployments,
    0,
  );
  const allDeployments = await prisma.deployment.findMany({
    where: { project: { userId: session!.user!.id } },
    select: { status: true, createdAt: true },
  });
  const succeeded = allDeployments.filter((d) => d.status === "success").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto text-text">
      {/* Top Search Bar */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="relative flex-1 max-w-xl">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Projects..."
            className="w-full pl-10 pr-4 py-2 bg-bg/50 border border-border rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button className="px-3 py-2 bg-surface/50 hover:bg-surface">
              <div className="w-4 h-4 border border-zinc-400 rounded-sm"></div>
            </button>
            <button className="px-3 py-2 hover:bg-surface/50 border-l border-r border-border">
              <div className="w-4 h-4 border border-zinc-400 rounded-sm grid grid-cols-2 gap-0.5">
                <div></div>
                <div></div>
              </div>
            </button>
            <button className="px-3 py-2 hover:bg-surface/50">
              <div className="w-4 h-4 border border-zinc-400 rounded-sm grid grid-cols-3 gap-0.5">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </button>
          </div>
          <AddNewButton />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN (Usage, Alerts, Previews) */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          {/* Usage */}
          <div>
            <h2 className="text-sm font-medium mb-4">Usage</h2>
            <div className="bg-bg/30 border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Last 30 days</span>
                <button className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-medium">
                  Upgrade
                </button>
              </div>

              <div className="space-y-3 text-xs text-muted">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    Image Optimization - Transformations
                  </div>
                  <span className="text-text">
                    120 <span className="text-zinc-600">/ 5K</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    Edge Requests
                  </div>
                  <span className="text-text">
                    18K <span className="text-zinc-600">/ 1M</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    Fluid Active CPU
                  </div>
                  <span className="text-text">
                    2m 55s <span className="text-zinc-600">/ 4h</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    ISR Reads
                  </div>
                  <span className="text-text">
                    9.4K <span className="text-zinc-600">/ 1M</span>
                  </span>
                </div>
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
                Automatically monitor your projects for anomalies and get
                notified.
              </p>
              <Link
                href="/dashboard/settings"
                className="text-xs font-medium text-white bg-surface hover:bg-zinc-700 px-4 py-1.5 rounded-lg inline-block transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>

          {/* Recent Previews */}
          <div>
            <h2 className="text-sm font-medium mb-4">Recent Previews</h2>
            <div className="bg-bg/30 border border-border rounded-xl p-10 text-center flex flex-col items-center justify-center min-h-[160px]">
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <p className="text-xs text-muted max-w-[200px]">
                Preview deployments that you have recently visited or created
                will appear here.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Projects Grid) */}
        <div className="col-span-12 lg:col-span-9">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium">Projects</h2>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-bg/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface/50 rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-1 text-text">
                No projects yet
              </h3>
              <p className="text-muted text-sm mb-4">
                Create your first project to get started
              </p>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
              >
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => (
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
                        <h3 className="text-sm font-medium truncate">
                          {project.name}
                        </h3>
                        <p className="text-[10px] text-muted truncate">
                          {project.name.toLowerCase().replace(/\s/g, "-")}
                          .vercel.app
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center">
                        <span className="text-[10px] text-muted">✓</span>
                      </div>
                      <button className="text-muted hover:text-text p-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* User/Git Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white">
                      A
                    </div>
                    <span className="text-[10px] text-muted font-medium">
                      Akitomiwa200/
                      {project.name.toLowerCase().replace(/\s/g, "-")}
                    </span>
                  </div>

                  {/* Last Deployment Info */}
                  <div className="space-y-2">
                    <p className="text-sm text-text line-clamp-1">
                      {project.description || "update project configuration"}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <StatusIcon status="success" />
                        <span>main</span>
                      </span>
                      <span>
                        {new Date(project.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Show More Footer */}
          {projects.length > 0 && (
            <div className="mt-6 text-center">
              <button className="text-sm font-medium text-muted hover:text-text transition-colors">
                Show More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
