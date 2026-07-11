import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  BarChart3,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

export default async function ObservabilityPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const deployments = await prisma.deployment.findMany({
    where: { project: { userId: session.user.id } },
    include: { project: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const failedDeployments = deployments.filter((d) => d.status === "failed");
  const successDeployments = deployments.filter((d) => d.status === "success");

  const healthMetrics = [
    {
      label: "Uptime",
      value: "99.97%",
      status: "healthy",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Error Rate",
      value: "0.12%",
      status: "healthy",
      icon: AlertTriangle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Avg. Response Time",
      value: "124ms",
      status: "healthy",
      icon: Clock,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Request Volume",
      value: "48.2K/day",
      status: "normal",
      icon: BarChart3,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  const services = [
    { name: "Web Server", status: "operational", latency: "24ms", uptime: "99.99%" },
    { name: "API Gateway", status: "operational", latency: "18ms", uptime: "99.98%" },
    { name: "Database", status: "operational", latency: "8ms", uptime: "100%" },
    { name: "Edge Functions", status: "operational", latency: "12ms", uptime: "99.95%" },
    { name: "Storage", status: "degraded", latency: "89ms", uptime: "99.80%" },
    { name: "CDN", status: "operational", latency: "6ms", uptime: "99.99%" },
  ];

  const recentIncidents = [
    {
      title: "Elevated error rates on Edge Functions",
      status: "resolved",
      duration: "23 min",
      time: "2 days ago",
    },
    {
      title: "Increased latency on API Gateway",
      status: "resolved",
      duration: "8 min",
      time: "5 days ago",
    },
    {
      title: "Storage service degradation",
      status: "investigating",
      duration: "ongoing",
      time: "Started 1 hour ago",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Observability</h1>
        <p className="text-muted text-sm mt-1">
          Monitor system health, errors, and performance across all services.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.bg}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium text-emerald-500">Healthy</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-text">{metric.value}</p>
              <p className="text-xs text-muted mt-1">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">System Status</h2>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50 text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">Service</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Latency</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 font-medium text-text">{service.name}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          service.status === "operational"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium capitalize ${
                          service.status === "operational"
                            ? "text-emerald-500"
                            : "text-amber-500"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 hidden sm:table-cell text-muted text-xs font-mono">
                    {service.latency}
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell text-muted text-xs">
                    {service.uptime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">Recent Incidents</h2>
            <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded-full">
              {recentIncidents.length} incidents
            </span>
          </div>
          <div className="space-y-3">
            {recentIncidents.map((incident, i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{incident.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          incident.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {incident.status}
                      </span>
                      <span className="text-xs text-muted">{incident.duration}</span>
                      <span className="text-xs text-muted">{incident.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">Deployment Health</h2>
            <Link
              href="/dashboard/deployments"
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-500">
                {successDeployments.length}
              </p>
              <p className="text-xs text-muted mt-1">Succeeded</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-2xl font-bold text-red-500">
                {failedDeployments.length}
              </p>
              <p className="text-xs text-muted mt-1">Failed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5 border border-border">
              <p className="text-2xl font-bold text-text">{deployments.length}</p>
              <p className="text-xs text-muted mt-1">Total</p>
            </div>
          </div>
          <div className="space-y-2">
            {deployments.slice(0, 6).map((dep) => (
              <Link
                key={dep.id}
                href={`/dashboard/projects/${dep.project.id}/deployments/${dep.id}`}
                className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {dep.status === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : dep.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm text-text">{dep.project.name}</span>
                </div>
                <span className="text-xs text-muted font-mono">
                  {dep.commitSha?.slice(0, 7) || "—"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
            <Layers className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text mb-1">Enable Detailed Tracing</h3>
            <p className="text-sm text-muted">
              Add distributed tracing to get deeper insights into request flows across your services. Available on Pro plan and above.
            </p>
          </div>
          <button className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
