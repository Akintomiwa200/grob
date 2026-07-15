import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export default async function AIGatewayDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

  const route = await prisma.aiGatewayRoute.findFirst({
    where: { id, project: { userId: session.user.id } },
    include: {
      logs: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { logs: true } },
    },
  });
  if (!route) notFound();

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);
  const [requestsToday, logsForLatency] = await Promise.all([
    prisma.aiGatewayLog.count({
      where: { routeId: id, createdAt: { gte: dayAgo } },
    }),
    prisma.aiGatewayLog.findMany({
      where: { routeId: id, createdAt: { gte: dayAgo } },
      select: { latencyMs: true, cached: true },
    }),
  ]);

  const avgLatency = logsForLatency.length
    ? Math.round(logsForLatency.reduce((s, l) => s + l.latencyMs, 0) / logsForLatency.length)
    : 0;
  const cacheHits = logsForLatency.filter((l) => l.cached).length;
  const cacheRate = logsForLatency.length
    ? Math.round((cacheHits / logsForLatency.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link
          href="/dashboard/ai-gateway"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to AI Gateway
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text font-mono">
                {route.name}
              </h1>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  route.enabled
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-zinc-500/10 text-zinc-400"
                }`}
              >
                {route.enabled ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="text-muted text-sm mt-1">
              <code className="font-mono text-xs bg-surface/50 px-1.5 py-0.5 rounded">
                {route.path}
              </code>{" "}
              → {route.model} ({route.provider})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Requests Today</p>
          <p className="text-2xl font-bold text-text">{requestsToday.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Cache Hit Rate</p>
          <p className="text-2xl font-bold text-emerald-500">
            {logsForLatency.length ? `${cacheRate}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Avg Latency</p>
          <p className="text-2xl font-bold text-text">
            {avgLatency ? `${avgLatency}ms` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-text">
            {route._count.logs.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Route Name</label>
              <input
                defaultValue={route.name}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Path</label>
              <input
                defaultValue={route.path}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Model</label>
              <input
                defaultValue={route.model}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Rate Limiting</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Requests per Minute
              </label>
              <input
                defaultValue={route.rateLimit}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Cache TTL (seconds)
              </label>
              <input
                defaultValue={route.cacheTtl}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">Request Logs</h2>
        </div>
        {route.logs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Clock className="h-6 w-6 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No requests logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/30 text-muted text-xs">
                <tr>
                  <th className="px-6 py-2 text-left font-medium">Time</th>
                  <th className="px-6 py-2 text-left font-medium">Method</th>
                  <th className="px-6 py-2 text-left font-medium">Status</th>
                  <th className="px-6 py-2 text-left font-medium">Latency</th>
                  <th className="px-6 py-2 text-left font-medium">Tokens</th>
                  <th className="px-6 py-2 text-left font-medium">Cached</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {route.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-2 text-xs text-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-2 text-xs font-mono text-text">{log.method}</td>
                    <td className="px-6 py-2">
                      <span
                        className={`text-xs font-medium ${
                          log.statusCode < 300
                            ? "text-emerald-500"
                            : log.statusCode < 500
                              ? "text-amber-500"
                              : "text-red-500"
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-xs font-mono text-muted">{log.latencyMs}ms</td>
                    <td className="px-6 py-2 text-xs text-muted">
                      {log.tokensIn}→{log.tokensOut}
                    </td>
                    <td className="px-6 py-2">
                      {log.cached && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                          HIT
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
