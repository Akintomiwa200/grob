import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Zap,
  Gauge,
  Eye,
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  CircleDot,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

export default async function SpeedInsightsPage(props: {
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

  const recentDeployments = project.deployments.slice(0, 5);
  const lastMeasured =
    recentDeployments.length > 0
      ? recentDeployments[0].updatedAt
      : new Date();

  const vitals = [
    {
      label: "Performance",
      score: 92,
      icon: <Gauge className="w-5 h-5" />,
      color: "text-success",
      bg: "bg-success",
      ring: "ring-success/20",
    },
    {
      label: "Accessibility",
      score: 98,
      icon: <Eye className="w-5 h-5" />,
      color: "text-success",
      bg: "bg-success",
      ring: "ring-success/20",
    },
    {
      label: "Best Practices",
      score: 95,
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "text-success",
      bg: "bg-success",
      ring: "ring-success/20",
    },
    {
      label: "SEO",
      score: 100,
      icon: <Search className="w-5 h-5" />,
      color: "text-success",
      bg: "bg-success",
      ring: "ring-success/20",
    },
  ];

  const mockMetrics = [
    { label: "First Contentful Paint", value: "0.8s", target: "< 1.8s", ok: true },
    { label: "Largest Contentful Paint", value: "1.2s", target: "< 2.5s", ok: true },
    { label: "Total Blocking Time", value: "45ms", target: "< 200ms", ok: true },
    { label: "Cumulative Layout Shift", value: "0.02", target: "< 0.1", ok: true },
    { label: "Time to Interactive", value: "1.1s", target: "< 3.8s", ok: true },
    { label: "Speed Index", value: "1.0s", target: "< 3.4s", ok: true },
  ];

  const statusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-error" />;
      case "building":
        return <Loader2 className="w-4 h-4 text-info animate-spin" />;
      default:
        return <CircleDot className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">
            Speed Insights
          </h2>
          <p className="text-muted text-sm">
            Performance insights for{" "}
            <span className="text-text font-medium">{project.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            Last measured:{" "}
            {new Date(lastMeasured).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text mb-3">
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {vitals.map((vital) => (
            <div
              key={vital.label}
              className="border border-border rounded-xl bg-surface p-5 flex flex-col items-center"
            >
              <div
                className={`relative w-20 h-20 rounded-full ring-4 ${vital.ring} bg-bg flex items-center justify-center mb-3`}
              >
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 80 80"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-border"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className={vital.color}
                    strokeDasharray={`${(vital.score / 100) * 226.2} 226.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-lg font-bold text-text relative z-10">
                  {vital.score}
                </span>
              </div>
              <p className="text-xs font-medium text-text">{vital.label}</p>
              <p className="text-[10px] text-success mt-0.5 font-medium">
                {vital.score >= 90 ? "Good" : vital.score >= 50 ? "Needs Work" : "Poor"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-text">
            Detailed Metrics
          </h3>
          <span className="text-[10px] text-muted ml-auto">Mock data</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border"
            >
              <div>
                <p className="text-xs text-muted">{metric.label}</p>
                <p className="text-sm font-semibold text-text mt-0.5">
                  {metric.value}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted">Target</p>
                <p className="text-xs text-success font-medium">
                  {metric.target}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-text">
            Latest Deployments
          </h3>
        </div>
        {recentDeployments.length === 0 ? (
          <p className="text-muted text-sm">
            No deployments yet to analyze performance.
          </p>
        ) : (
          <div className="space-y-2">
            {recentDeployments.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {statusIcon(dep.status)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {dep.commitMsg || "Manual Deployment"}
                    </p>
                    <p className="text-xs text-muted font-mono">
                      {dep.commitSha
                        ? dep.commitSha.slice(0, 7)
                        : "no commit"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-muted capitalize">
                    {dep.branch || "main"}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(dep.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
