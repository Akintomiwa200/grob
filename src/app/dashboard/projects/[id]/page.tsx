import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { deployProject } from "./actions";
import { DeployMenu } from "./deployments/[deploymentId]/trigger-build";
import { AutoRedeploy } from "./AutoRedeploy";
import { LiveRefresh } from "./LiveRefresh";
import { DeploymentCardMenu } from "./DeploymentCardMenu";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { deployments: { orderBy: { createdAt: "desc" }, take: 50 } },
  });

  if (!project) notFound();

  const hasActiveDeploy = project.deployments.some(
    (d) => d.status === "building" || d.status === "pending",
  );

  const activeDeploymentId = project.deployments.find(
    (d) => d.status === "success",
  )?.id ?? null;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    building: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  const statusDots: Record<string, string> = {
    pending: "bg-yellow-500",
    building: "bg-blue-500",
    success: "bg-green-500",
    failed: "bg-red-500",
  };

  return (
    <>
      <AutoRedeploy projectId={project.id} />
      <LiveRefresh active={hasActiveDeploy} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-5 border border-border rounded-xl bg-bg/50 shadow-sm">
          <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1.5">Framework</p>
          <p className="font-medium text-text">{project.framework || "Custom"}</p>
        </div>
        <div className="p-5 border border-border rounded-xl bg-bg/50 shadow-sm">
          <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1.5">Build Command</p>
          <p className="font-mono text-sm text-text bg-surface px-2 py-1 rounded w-max overflow-x-auto max-w-full scrollbar-hidden">{project.buildCommand}</p>
        </div>
        <div className="p-5 border border-border rounded-xl bg-bg/50 shadow-sm">
          <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1.5">Output Directory</p>
          <p className="font-mono text-sm text-text bg-surface px-2 py-1 rounded w-max overflow-x-auto max-w-full scrollbar-hidden">{project.outputDir}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Deployments</h2>
          {project.deployments.length > 0 && (
            <DeployMenu
              projectId={project.id}
              deploymentId={project.deployments[0].id}
              hasPreviousDeployment={project.deployments.length > 1}
            />
          )}
        </div>
        {project.deployments.length === 0 ? (
          <div className="text-center py-16 border border-border bg-surface/30 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-text mb-1">No deployments yet</h3>
            <p className="text-muted text-sm mb-4">Trigger a deployment from GitHub or deploy manually.</p>
            <form action={deployProject.bind(null, project.id)}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm"
              >
                Deploy Now
              </button>
            </form>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-bg/50 shadow-sm divide-y divide-border">
            {project.deployments.map((dep) => (
              <div key={dep.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                <Link
                  href={`/dashboard/projects/${project.id}/deployments/${dep.id}`}
                  className="flex-1 flex items-start gap-4"
                >
                  <span className={`mt-1.5 w-2.5 h-2.5 shrink-0 rounded-full ${statusDots[dep.status] || "bg-zinc-500"}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-medium text-text hover:underline truncate max-w-[200px] sm:max-w-md">
                        {dep.commitMsg || `Manual Deployment`}
                      </p>
                      <span className={`px-2 py-0.5 border rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColors[dep.status] || "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>
                        {dep.status}
                      </span>
                      {dep.id === activeDeploymentId && (
                        <span className="px-2 py-0.5 border border-green-500/30 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-green-400">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        {dep.branch || "main"}
                      </span>
                      {dep.commitSha && (
                        <span className="flex items-center gap-1.5 font-mono">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          {dep.commitSha.slice(0, 7)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-3 pl-6 sm:pl-0 mt-3 sm:mt-0">
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs text-muted">
                    <p>{new Date(dep.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="mt-0.5">{new Date(dep.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                  <DeploymentCardMenu projectId={project.id} deploymentId={dep.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
