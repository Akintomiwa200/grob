import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function DeploymentsPage(props: {
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

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    building: "bg-blue-500/10 text-blue-500",
    success: "bg-green-500/10 text-green-500",
    failed: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Deployments</h2>
        <p className="text-muted text-sm">
          Deployment history for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>
      {project.deployments.length === 0 ? (
        <div className="border border-border rounded-xl bg-surface p-10 text-center">
          <p className="text-muted text-sm">No deployments yet.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-bg/50 divide-y divide-border">
          {project.deployments.map((dep) => (
            <Link
              key={dep.id}
              href={`/dashboard/projects/${project.id}/deployments/${dep.id}`}
              className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${statusColors[dep.status] || "bg-zinc-500"}`} />
                <div>
                  <p className="text-sm font-medium text-text">{dep.commitMsg || "Manual Deployment"}</p>
                  <p className="text-xs text-muted">{dep.branch || "main"}</p>
                </div>
              </div>
              <p className="text-xs text-muted">
                {new Date(dep.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
