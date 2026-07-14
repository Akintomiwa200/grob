import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  BarChart3,
  Activity,
  CheckCircle2,
  XCircle,
  Calendar,
  HardDrive,
  Clock,
  Zap,
} from "lucide-react";

export default async function UsagePage(props: {
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

  const totalDeployments = project.deployments.length;
  const successCount = project.deployments.filter(
    (d) => d.status === "success"
  ).length;
  const failedCount = project.deployments.filter(
    (d) => d.status === "failed"
  ).length;

  const usageItems = [
    {
      label: "Bandwidth",
      icon: HardDrive,
      used: "4.2 GB",
      limit: "10 GB",
      percent: 42,
      color: "bg-accent",
    },
    {
      label: "Build Minutes",
      icon: Clock,
      used: "142 min",
      limit: "1,000 min",
      percent: 14.2,
      color: "bg-info",
    },
    {
      label: "Serverless Functions",
      icon: Zap,
      used: "2,847",
      limit: "100,000",
      percent: 2.8,
      color: "bg-success",
    },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Usage</h2>
        <p className="text-muted text-sm">
          Resource usage and billing for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Deployment Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">
            Deployment Summary
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">
                Total Deployments
              </p>
            </div>
            <p className="text-2xl font-bold text-text">{totalDeployments}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">
                Successful
              </p>
            </div>
            <p className="text-2xl font-bold text-success">{successCount}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-error" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">
                Failed
              </p>
            </div>
            <p className="text-2xl font-bold text-error">{failedCount}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-info" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">
                Most Active Day
              </p>
            </div>
            <p className="text-2xl font-bold text-text">Monday</p>
            <p className="text-xs text-muted mt-1">18 deployments</p>
          </div>
        </div>
      </section>

      {/* Resource Usage */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Resource Usage</h3>
        </div>
        <div className="space-y-4">
          {usageItems.map((item) => (
            <div
              key={item.label}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{item.label}</p>
                    <p className="text-xs text-muted">
                      {item.used} of {item.limit} used
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-text">
                  {item.percent}%
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.color}`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly Breakdown */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">
            Monthly Breakdown
          </h3>
        </div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_100px_100px_100px] gap-4 px-5 py-3 border-b border-border text-xs font-medium text-muted uppercase tracking-wider">
            <span>Month</span>
            <span>Deployments</span>
            <span>Bandwidth</span>
            <span>Build Time</span>
            <span>Functions</span>
          </div>
          {[
            {
              month: "July 2026",
              deployments: totalDeployments,
              bandwidth: "1.4 GB",
              buildTime: "48 min",
              functions: "947",
            },
            {
              month: "June 2026",
              deployments: 34,
              bandwidth: "2.8 GB",
              buildTime: "94 min",
              functions: "1,900",
            },
          ].map((row, i) => (
            <div
              key={row.month}
              className="grid grid-cols-[1fr_100px_100px_100px_100px] gap-4 items-center px-5 py-4 border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <p className="text-sm font-medium text-text">{row.month}</p>
              <p className="text-sm text-text">{row.deployments}</p>
              <p className="text-sm text-text">{row.bandwidth}</p>
              <p className="text-sm text-text">{row.buildTime}</p>
              <p className="text-sm text-text">{row.functions}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
