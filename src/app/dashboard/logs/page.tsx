import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ScrollText, Terminal, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function LogsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const recentDeployments = await prisma.deployment.findMany({
    where: { project: { userId: session.user.id } },
    include: { project: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Logs</h1>
        <p className="text-muted text-sm mt-1">View real-time logs from your deployments and serverless functions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-3">
            <Terminal className="h-5 w-5 text-accent" />
          </div>
          <h3 className="font-semibold text-text mb-1">Build Logs</h3>
          <p className="text-sm text-muted mb-4">View build output from recent deployments.</p>
          <span className="text-xs text-muted">{recentDeployments.length} recent deployments</span>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 mb-3">
            <Terminal className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-text mb-1">Runtime Logs</h3>
          <p className="text-sm text-muted mb-4">Monitor your serverless function invocations.</p>
          <span className="text-xs text-muted">Coming soon</span>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 mb-3">
            <Terminal className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-text mb-1">Audit Log</h3>
          <p className="text-sm text-muted mb-4">Track changes to your projects and settings.</p>
          <span className="text-xs text-muted">Coming soon</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">Recent Build Logs</h2>
        </div>
        {recentDeployments.length > 0 ? (
          <div className="divide-y divide-border">
            {recentDeployments.map((dep) => (
              <Link
                key={dep.id}
                href={`/dashboard/projects/${dep.project.id}/deployments/${dep.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${dep.status === "success" ? "bg-emerald-500" : dep.status === "failed" ? "bg-red-500" : "bg-amber-500"}`} />
                  <span className="text-sm text-text">{dep.project.name}</span>
                  <span className="text-xs text-muted font-mono">{dep.commitSha?.slice(0, 7)}</span>
                </div>
                <span className="text-xs text-muted group-hover:text-text transition-colors flex items-center gap-1">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <ScrollText className="h-6 w-6 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No logs yet. Deploy a project to see build logs here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
