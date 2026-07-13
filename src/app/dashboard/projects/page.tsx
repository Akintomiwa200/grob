import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { deployments: true } },
      deployments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, createdAt: true, commitMsg: true },
      },
    },
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto text-text">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-bg/20">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface/50 rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
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
            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group block bg-bg/20 border border-border rounded-xl p-5 hover:border-[#6E5BFF]/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 truncate flex-1">
                    <div className="w-9 h-9 rounded-lg bg-surface/80 flex-shrink-0 flex items-center justify-center text-xs font-bold text-text">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <h3 className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-[10px] text-muted truncate font-mono">
                        {project.slug}.localhost:3000
                      </p>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-muted mb-3 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    {latest ? (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${latest.status === "success" ? "bg-green-500" : latest.status === "failed" ? "bg-red-500" : "bg-yellow-500"}`} />
                        <span>{latest.commitMsg || latest.status}</span>
                      </>
                    ) : (
                      <span>No deployments</span>
                    )}
                  </div>
                  <span>{project._count.deployments} deploy{project._count.deployments !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
