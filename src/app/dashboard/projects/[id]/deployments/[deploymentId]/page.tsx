/**
 * Deployment detail page — Overview tab.
 *
 * Schema note: this UI needs a bit more than the original Deployment model
 * exposed. Add these fields/relations if they don't exist yet:
 *
 *   model Deployment {
 *     ...
 *     buildDurationMs Int?
 *     readyAt         DateTime?
 *     aliases         String[]                 // extra domains besides `url`
 *     repository      String?                  // "acme-io/new-homepage"
 *     creatorName     String?
 *     creatorImage    String?
 *     invocations     DeploymentInvocation[]
 *   }
 *
 *   model DeploymentInvocation {
 *     id               String   @id @default(cuid())
 *     deploymentId     String
 *     deployment       Deployment @relation(fields: [deploymentId], references: [id])
 *     path             String
 *     timestamp        DateTime
 *     durationMs       Float
 *     billedDurationMs Int
 *     memorySizeMb     Int
 *     maxMemoryUsedMb  Int
 *   }
 *
 * Everything below degrades gracefully (empty arrays / "—") if those fields
 * are absent, so this still compiles and renders against the old schema —
 * you just won't see runtime logs or extra domains until the migration lands.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DeploymentTabs } from "./deployment-tabs";
import { VisitButton } from "./visit-button";
import { DeploymentLogs } from "./logs";
import { TriggerBuild } from "./trigger-build";
import { rollbackToDeployment } from "./actions";

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  pending: { dot: "bg-[#F5A623]", text: "text-[#F5A623]" },
  building: { dot: "bg-[#0070F3]", text: "text-[#0070F3]" },
  deploying: { dot: "bg-[#0070F3]", text: "text-[#0070F3]" },
  success: { dot: "bg-[#3DDC97]", text: "text-[#3DDC97]" },
  failed: { dot: "bg-[#E5484D]", text: "text-[#E5484D]" },
};

function formatDuration(ms: number | null | undefined) {
  if (!ms || ms < 0) return "—";
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

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

  const status = STATUS_STYLES[deployment.status] ?? {
    dot: "bg-gray-400",
    text: "text-gray-400",
  };

  const durationMs =
    new Date(deployment.updatedAt).getTime() -
    new Date(deployment.createdAt).getTime();

  const domains = [deployment.url, deployment.alias].filter(
    (d): d is string => Boolean(d),
  );

  return (
    <div>
      <TriggerBuild deploymentId={deploymentId} />
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${id}`}
          className="mb-1 block text-sm text-muted hover:text-text"
        >
          &larr; {project.name}
        </Link>
      </div>

      <DeploymentTabs projectId={id} deploymentId={deploymentId} />

      <div className="mt-6 flex flex-col gap-8 border-b border-border pb-8 md:flex-row md:items-start">
        {/* Preview thumbnail */}
        <div className="flex h-32 w-full shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-bg md:w-48">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium uppercase tracking-widest text-muted">
            {project.name}
          </span>
        </div>

        {/* Meta grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                Status
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm">
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                <span className={`capitalize ${status.text}`}>
                  {deployment.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                Smart CDN
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4 text-[#0070F3]"
                >
                  <circle cx="10" cy="10" r="9" fill="currentColor" />
                  <path
                    d="M6 10.5l2.5 2.5L14 7.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Enabled
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                Deployment Duration
              </p>
              <p className="mt-1.5 text-sm text-text">
                {formatDuration(durationMs)}
              </p>
            </div>
            <div className="col-span-2 flex items-start sm:col-span-1 sm:justify-end lg:col-span-1">
              <VisitButton primaryUrl={deployment.url} domains={domains} />
            </div>
          </div>

          {domains.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-muted">
                Domains
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {domains.map((d) => (
                    <a
                      key={d}
                      href={(d.includes("localhost") || d.includes("127.0.0.1")) ? `http://${d}` : `https://${d}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text hover:text-accent hover:underline"
                    >
                      {d}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-border py-6 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            Commit
          </p>
          <p className="mt-1.5 truncate font-mono text-sm text-text">
            {deployment.commitSha.slice(0, 7)}
            {deployment.commitMsg ? ` — ${deployment.commitMsg}` : ""}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            Branch
          </p>
          <p className="mt-1.5 font-mono text-sm text-text">
            {deployment.branch}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            Deployed
          </p>
          <p className="mt-1.5 text-sm text-text">
            {new Date(deployment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="pt-6">
        <DeploymentLogs
          deploymentId={deployment.id}
          initialBuildLogs={deployment.logs}
          status={deployment.status}
          invocations={[]}
        />
      </div>

      {deployment.status === "success" && (
        <div className="mt-8 border-t border-border pt-8">
          <h2 className="mb-3 text-lg font-semibold text-text">Actions</h2>
          <form
            action={rollbackToDeployment.bind(null, project.id, deployment.id)}
          >
            <button
              type="submit"
              className="rounded-lg border border-orange-800 px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-950"
            >
              Rollback to this deployment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
