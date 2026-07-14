import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { LogViewer } from "./LogViewer";
import { LiveRefresh } from "../LiveRefresh";

export default async function LogsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { deployments: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  const hasActiveDeploy = project.deployments.some(
    (d) => d.status === "building" || d.status === "pending",
  );

  const totalLogs = project.deployments.reduce(
    (acc, d) => acc + (d.logs ? d.logs.split("\n").length : 0),
    0
  );

  return (
    <div className="max-w-6xl space-y-6">
      <LiveRefresh active={hasActiveDeploy} />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">Logs</h2>
          <p className="text-muted text-sm">
            Build logs for{" "}
            <span className="text-text font-medium">{project.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted">Total Deployments</p>
            <p className="text-lg font-semibold text-text">
              {project.deployments.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent" />
          </div>
        </div>
      </div>

      {project.deployments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["success", "failed", "building", "pending"] as const).map(
            (status) => {
              const count = project.deployments.filter(
                (d) => d.status === status
              ).length;
              const colors = {
                success: "text-success bg-success/10",
                failed: "text-error bg-error/10",
                building: "text-info bg-info/10",
                pending: "text-yellow-500 bg-yellow-500/10",
              };
              return (
                <div
                  key={status}
                  className="border border-border rounded-xl bg-surface p-3"
                >
                  <p className="text-xs text-muted capitalize">{status}</p>
                  <p
                    className={`text-xl font-bold mt-1 ${colors[status].split(" ")[0]}`}
                  >
                    {count}
                  </p>
                </div>
              );
            }
          )}
        </div>
      )}

      <LogViewer
        deployments={project.deployments.map((d) => ({
          id: d.id,
          status: d.status,
          logs: d.logs,
          branch: d.branch,
          commitSha: d.commitSha,
          commitMsg: d.commitMsg,
          createdAt: d.createdAt.toISOString(),
        }))}
        projectName={project.name}
      />
    </div>
  );
}
