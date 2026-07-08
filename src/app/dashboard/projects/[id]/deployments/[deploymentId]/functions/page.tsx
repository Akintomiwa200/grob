import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DeploymentTabs } from "../deployment-tabs";

const runtimeColors: Record<string, string> = {
  nodejs: "bg-green-400/10 text-green-400",
  python: "bg-blue-400/10 text-blue-400",
  go: "bg-cyan-400/10 text-cyan-400",
  ruby: "bg-red-400/10 text-red-400",
  rust: "bg-orange-400/10 text-orange-400",
};

const methodColors: Record<string, string> = {
  ANY: "bg-muted/10 text-muted",
  GET: "bg-green-400/10 text-green-400",
  POST: "bg-blue-400/10 text-blue-400",
  PUT: "bg-orange-400/10 text-orange-400",
  PATCH: "bg-purple-400/10 text-purple-400",
  DELETE: "bg-red-400/10 text-red-400",
};

export default async function DeploymentFunctionsPage(props: {
  params: Promise<{ id: string; deploymentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, deploymentId } = await props.params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { functions: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, projectId: id },
  });
  if (!deployment) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${id}`}
          className="mb-1 block text-sm text-muted hover:text-text"
        >
          &larr; {project.name}
        </Link>
      </div>

      <DeploymentTabs projectId={id} deploymentId={deploymentId} />

      <div className="mt-6 max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Deployed Functions</h2>
          <p className="text-sm text-muted">
            Serverless functions included in this deployment.
          </p>
        </div>

        {project.functions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted text-sm">No functions configured for this project.</p>
            <Link
              href={`/dashboard/projects/${id}/functions`}
              className="text-accent text-sm hover:underline mt-1 inline-block"
            >
              Configure functions
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {project.functions.map((fn) => (
              <div
                key={fn.id}
                className="p-4 border rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded font-mono uppercase ${
                      methodColors[fn.method] || methodColors.ANY
                    }`}
                  >
                    {fn.method}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-sm truncate">{fn.name}</p>
                    <p className="font-mono text-xs text-muted truncate">
                      {fn.sourcePath || fn.name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${
                      runtimeColors[fn.runtime] || "bg-white/[0.05] text-muted"
                    }`}
                  >
                    {fn.runtime}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      fn.status === "active"
                        ? "bg-green-400/10 text-green-400"
                        : "bg-white/[0.05] text-muted"
                    }`}
                  >
                    {fn.status === "active" ? "Deployed" : "Skipped"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border rounded-xl bg-surface/50">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-2">
            Deployment Summary
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted">Functions:</span>{" "}
              <span className="text-text">
                {project.functions.filter((f) => f.status === "active").length} active
              </span>
            </div>
            <div>
              <span className="text-muted">Commit:</span>{" "}
              <span className="font-mono text-text">
                {deployment.commitSha.slice(0, 7)}
              </span>
            </div>
            <div>
              <span className="text-muted">Branch:</span>{" "}
              <span className="font-mono text-text">{deployment.branch}</span>
            </div>
            <div>
              <span className="text-muted">Status:</span>{" "}
              <span className="capitalize text-text">{deployment.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
