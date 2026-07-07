import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DeploymentLogs } from "./logs";

export default async function DeploymentDetailPage(props: {
  params: Promise<{ id: string; deploymentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, deploymentId } = await props.params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, projectId: id },
  });
  if (!deployment) notFound();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-400",
    building: "bg-blue-400",
    success: "bg-green-400",
    failed: "bg-red-400",
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/projects/${id}`}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-1 block"
        >
          &larr; {project.name}
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Deployment</h1>
          <span className={`flex items-center gap-1.5 text-sm`}>
            <span className={`w-2 h-2 rounded-full ${statusColors[deployment.status] || "bg-gray-400"}`} />
            <span className="capitalize">{deployment.status}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-3 border rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400">Branch</p>
          <p className="font-mono text-sm mt-0.5">{deployment.branch}</p>
        </div>
        <div className="p-3 border rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400">Commit</p>
          <p className="font-mono text-sm mt-0.5">{deployment.commitSha.slice(0, 7)}</p>
        </div>
        <div className="p-3 border rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
          <p className="text-sm mt-0.5">{new Date(deployment.createdAt).toLocaleString()}</p>
        </div>
        <div className="p-3 border rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400">URL</p>
          <p className="text-sm mt-0.5 font-mono truncate">
            {deployment.url ? (
              <a href={`https://${deployment.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                {deployment.url}
              </a>
            ) : (
              "-"
            )}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Build Logs</h2>
        <DeploymentLogs deploymentId={deployment.id} initialLogs={deployment.logs} status={deployment.status} />
      </div>
    </div>
  );
}
