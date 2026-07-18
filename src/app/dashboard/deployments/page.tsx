import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Box, ArrowRight, GitBranch, Clock, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

const statusIcon: Record<string, { icon: any; color: string }> = {
  success: { icon: CheckCircle2, color: "text-emerald-500" },
  failed: { icon: XCircle, color: "text-red-500" },
  building: { icon: RotateCcw, color: "text-blue-500" },
  pending: { icon: Clock, color: "text-amber-500" },
};

export default async function DeploymentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const deployments = await prisma.deployment.findMany({
    where: {
      project: { userId: session.user.id },
    },
    include: { project: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Deployments</h1>
        <p className="text-muted text-sm mt-1">All deployments across your projects.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface/50 text-muted">
            <tr>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Project</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">Branch</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Commit</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Age</th>
              <th className="px-6 py-4 font-medium text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deployments.map((dep) => {
              const status = statusIcon[dep.status] || statusIcon.pending;
              const StatusIcon = status.icon;
              return (
                <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 ${status.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-xs font-medium capitalize">{dep.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/projects/${dep.project.id}`} className="font-medium text-text hover:text-accent transition-colors">
                      {dep.project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
                      <GitBranch className="h-3 w-3" />
                      {dep.branch || "main"}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="font-mono text-xs text-muted">
                      {dep.commitSha ? dep.commitSha.slice(0, 7) : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-muted text-xs">
                    {formatRelativeTime(dep.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/projects/${dep.project.id}/deployments/${dep.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-text transition-colors"
                    >
                      Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {deployments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                      <Box className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-muted text-sm">No deployments yet.</p>
                    <Link href="/dashboard/projects/new" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                      Deploy your first project &rarr;
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
