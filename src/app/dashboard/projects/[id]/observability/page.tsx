import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  TrendingDown,
  CalendarDays,
} from "lucide-react";
import { LiveRefresh } from "../LiveRefresh";

export default async function ObservabilityPage(props: {
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

  const deployments = project.deployments;
  const total = deployments.length;
  const successCount = deployments.filter((d) => d.status === "success").length;
  const failedDeployments = deployments.filter((d) => d.status === "failed");
  const failedCount = failedDeployments.length;
  const uptime = total > 0 ? +((successCount / total) * 100).toFixed(1) : 100;

  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const failures = deployments.filter((d) => {
      if (d.status !== "failed") return false;
      const dDate = new Date(d.createdAt);
      return dDate >= date && dDate < nextDay;
    }).length;
    return {
      label: date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      shortLabel: date.toLocaleDateString(undefined, { day: "numeric" }),
      failures,
    };
  });
  const maxFailures = Math.max(...last7Days.map((d) => d.failures), 1);

  const mostRecentFailure = failedDeployments.length > 0 ? failedDeployments[0] : null;

  const extractErrorLines = (logs: string) => {
    if (!logs) return ["No log data available."];
    const lines = logs.split("\n");
    const errorLines = lines.filter(
      (line) =>
        line.toLowerCase().includes("error") ||
        line.toLowerCase().includes("fail") ||
        line.toLowerCase().includes("panic") ||
        line.toLowerCase().includes("fatal")
    );
    return errorLines.length > 0
      ? errorLines.slice(0, 15)
      : ["No specific error lines found in logs."];
  };

  return (
    <div className="max-w-6xl space-y-6">
      <LiveRefresh active={hasActiveDeploy} />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">
            Observability
          </h2>
          <p className="text-muted text-sm">
            Error tracking and monitoring for{" "}
            <span className="text-text font-medium">{project.name}</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-accent" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-border rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-success" />
            <p className="text-xs text-muted">Uptime</p>
          </div>
          <p
            className={`text-2xl font-bold ${
              uptime >= 99
                ? "text-success"
                : uptime >= 95
                  ? "text-yellow-500"
                  : "text-error"
            }`}
          >
            {uptime}%
          </p>
        </div>
        <div className="border border-border rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <p className="text-xs text-muted">Successful</p>
          </div>
          <p className="text-2xl font-bold text-success">{successCount}</p>
        </div>
        <div className="border border-border rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-error" />
            <p className="text-xs text-muted">Failed</p>
          </div>
          <p className="text-2xl font-bold text-error">{failedCount}</p>
        </div>
        <div className="border border-border rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-info" />
            <p className="text-xs text-muted">Total</p>
          </div>
          <p className="text-2xl font-bold text-text">{total}</p>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-text">
            Error Timeline (Last 7 Days)
          </h3>
        </div>
        {total === 0 ? (
          <div className="h-36 flex items-center justify-center text-muted text-sm">
            No data available yet.
          </div>
        ) : (
          <div className="flex items-end gap-2 h-36">
            {last7Days.map((day, i) => {
              const height =
                day.failures > 0
                  ? Math.max((day.failures / maxFailures) * 100, 10)
                  : 0;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  {day.failures > 0 && (
                    <span className="text-[10px] text-error font-medium">
                      {day.failures}
                    </span>
                  )}
                  <div className="w-full flex justify-center">
                    <div
                      className={`w-full max-w-[40px] rounded-t-md transition-colors ${
                        day.failures > 0
                          ? "bg-error/80 hover:bg-error"
                          : "bg-border/50"
                      }`}
                      style={{
                        height:
                          day.failures > 0 ? `${height}%` : "4px",
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-muted mt-1 text-center leading-tight">
                    {day.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mostRecentFailure && (
        <div className="border border-error/50 rounded-xl bg-surface p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-error" />
            <h3 className="text-sm font-semibold text-error">
              Most Recent Failure
            </h3>
            <span className="text-[10px] text-muted ml-auto">
              {new Date(mostRecentFailure.createdAt).toLocaleDateString(
                undefined,
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </div>
          <div className="bg-bg rounded-lg border border-border p-4 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium text-text font-mono">
                {mostRecentFailure.commitSha
                  ? mostRecentFailure.commitSha.slice(0, 7)
                  : "no commit"}
              </span>
              <span className="text-xs text-muted">
                {mostRecentFailure.branch || "main"}
              </span>
            </div>
            <p className="text-sm text-text">
              {mostRecentFailure.commitMsg || "Manual Deployment"}
            </p>
          </div>
          <pre className="bg-[#0B0E14] rounded-lg p-4 overflow-x-auto max-h-[200px] overflow-y-auto">
            <code className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap break-all">
              {extractErrorLines(mostRecentFailure.logs).join("\n")}
            </code>
          </pre>
        </div>
      )}

      <div className="border border-border rounded-xl bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-text">
            Failed Deployments ({failedCount})
          </h3>
        </div>
        {failedCount === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm text-muted">
              No failed deployments. Everything is running smoothly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {failedDeployments.slice(0, 10).map((dep, i) => {
              const errorLines = extractErrorLines(dep.logs);
              return (
                <div
                  key={dep.id}
                  className={`bg-bg rounded-lg border p-4 ${
                    i === 0 ? "border-error/40" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-error" />
                      <span className="text-sm font-medium text-text">
                        {dep.commitMsg || "Manual Deployment"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted font-mono">
                        {dep.commitSha ? dep.commitSha.slice(0, 7) : "—"}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(dep.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted font-mono bg-bg border border-border rounded px-2 py-0.5">
                      {dep.branch || "main"}
                    </span>
                  </div>
                  <pre className="bg-[#0B0E14] rounded-lg p-3 overflow-x-auto max-h-[120px] overflow-y-auto">
                    <code className="text-[11px] font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap break-all">
                      {errorLines.slice(0, 5).join("\n")}
                    </code>
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
