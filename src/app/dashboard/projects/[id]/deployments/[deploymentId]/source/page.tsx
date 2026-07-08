import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DeploymentTabs } from "../deployment-tabs";

const exampleFiles = [
  { name: "src/app/page.tsx", status: "modified", lines: "+12 / -3" },
  { name: "src/app/layout.tsx", status: "modified", lines: "+1 / -1" },
  { name: "src/components/Header.tsx", status: "added", lines: "+45 / -0" },
  { name: "src/lib/api.ts", status: "modified", lines: "+8 / -4" },
  { name: "package.json", status: "modified", lines: "+2 / -1" },
];

const statusStyles: Record<string, string> = {
  added: "text-green-400",
  modified: "text-amber-400",
  removed: "text-red-400",
};

export default async function DeploymentSourcePage(props: {
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
        {/* Commit card */}
        <div className="p-5 border rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v6m0 8v6M2 12h6m8 0h6" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text">
                {deployment.commitMsg || "Manual deploy"}
              </p>
              <p className="mt-1 font-mono text-xs text-muted">
                {deployment.commitSha}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                <span>
                  Branch:{" "}
                  <span className="font-mono text-text">{deployment.branch}</span>
                </span>
                <span>
                  Deployed:{" "}
                  <span className="text-text">
                    {new Date(deployment.createdAt).toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Git stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-xl text-center">
            <p className="text-xs text-muted uppercase tracking-wide">Files Changed</p>
            <p className="mt-1 text-2xl font-semibold text-text">{exampleFiles.length}</p>
          </div>
          <div className="p-4 border rounded-xl text-center">
            <p className="text-xs text-muted uppercase tracking-wide">Additions</p>
            <p className="mt-1 text-2xl font-semibold text-green-400">68</p>
          </div>
          <div className="p-4 border rounded-xl text-center">
            <p className="text-xs text-muted uppercase tracking-wide">Deletions</p>
            <p className="mt-1 text-2xl font-semibold text-red-400">9</p>
          </div>
        </div>

        {/* File list */}
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">
            Changed Files
          </h3>
          <div className="space-y-1">
            {exampleFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between rounded-lg px-4 py-2.5 border hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-medium uppercase w-16 shrink-0 ${statusStyles[file.status] || "text-muted"}`}>
                    {file.status}
                  </span>
                  <span className="font-mono text-sm text-text truncate">
                    {file.name}
                  </span>
                </div>
                <span className="text-xs text-muted shrink-0 ml-4">
                  {file.lines}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Diff preview */}
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Diff Preview</h3>
          <div className="rounded-xl bg-[#0C0F14] border border-border overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted">
              <span className="font-medium text-text">src/lib/api.ts</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-[1.8] font-mono">{`@@ -23,6 +23,10 @@ export async function fetchData(url: string) {
   return response.json();
 }

+export async function postData(url: string, body: unknown) {
+  const response = await fetch(url, {
+    method: "POST",
+    headers: { "Content-Type": "application/json" },
+    body: JSON.stringify(body),
+  });
+  return response.json();
+}
+
 export function formatError(error: unknown): string {`}</pre>
          </div>
        </div>

        {!project.gitUrl && (
          <div className="p-4 border border-dashed rounded-xl">
            <p className="text-sm text-muted text-center">
              No git repository linked.{" "}
              <Link
                href={`/dashboard/projects/${id}/settings`}
                className="text-accent hover:underline"
              >
                Link a repository
              </Link>{" "}
              to see full source history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
