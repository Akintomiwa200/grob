import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { deployProject } from "./actions";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { deployments: { orderBy: { createdAt: "desc" }, take: 50 } },
  });

  if (!project) notFound();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-400 text-yellow-900",
    building: "bg-blue-400 text-blue-900",
    success: "bg-green-400 text-green-900",
    failed: "bg-red-400 text-red-900",
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-1 block">
            &larr; Projects
          </Link>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{project.description}</p>
          )}
        </div>
        <form action={deployProject.bind(null, project.id)}>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-black rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200"
          >
            Deploy
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-4 border rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Framework</p>
          <p className="mt-1 font-medium">{project.framework || "Custom"}</p>
        </div>
        <div className="p-4 border rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Build Command</p>
          <p className="mt-1 font-mono text-sm">{project.buildCommand}</p>
        </div>
        <div className="p-4 border rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Output Directory</p>
          <p className="mt-1 font-mono text-sm">{project.outputDir}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b pb-0">
        <span className="pb-3 border-b-2 border-gray-900 dark:border-white text-sm font-medium">Deployments</span>
        <Link href={`/dashboard/projects/${id}/domains`} className="pb-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          Domains
        </Link>
        <Link href={`/dashboard/projects/${id}/settings`} className="pb-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          Settings
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Deployments</h2>
        {project.deployments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No deployments yet. Click "Deploy" to start.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {project.deployments.map((dep) => (
              <Link
                key={dep.id}
                href={`/dashboard/projects/${project.id}/deployments/${dep.id}`}
                className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${statusColors[dep.status]?.split(" ")[0] || "bg-gray-400"}`} />
                  <div>
                    <p className="text-sm font-medium">
                      {dep.commitMsg || `Deploy #${dep.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {dep.branch} &middot; {dep.commitSha.slice(0, 7) || "HEAD"}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[dep.status] || "bg-gray-100 text-gray-600"}`}>
                    {dep.status}
                  </span>
                  <p className="mt-1">{new Date(dep.createdAt).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
