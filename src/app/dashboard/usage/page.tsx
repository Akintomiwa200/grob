import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PieChart, Box, Globe2, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function UsagePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const projectCount = await prisma.project.count({ where: { userId: session.user.id } });
  const deploymentCount = await prisma.deployment.count({
    where: { project: { userId: session.user.id } },
  });
  const successCount = await prisma.deployment.count({
    where: { project: { userId: session.user.id }, status: "success" },
  });
  const domainCount = await prisma.domain.count({
    where: { project: { userId: session.user.id } },
  });

  const usageStats = [
    { label: "Projects", value: projectCount, icon: Box, color: "text-accent", bg: "bg-accent/10" },
    { label: "Deployments", value: deploymentCount, icon: PieChart, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Success Rate", value: deploymentCount ? `${Math.round((successCount / deploymentCount) * 100)}%` : "—", icon: PieChart, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Domains", value: domainCount, icon: Globe2, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Usage & Billing</h1>
        <p className="text-muted text-sm mt-1">Monitor your resource consumption and plan limits.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {usageStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">Plan Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">Current Plan</span>
            <span className="text-sm font-medium text-text bg-accent/10 px-3 py-1 rounded-full">Hobby</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-sm text-muted">Projects</span>
            <span className="text-sm text-text">{projectCount} / 10</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-sm text-muted">Bandwidth</span>
            <span className="text-sm text-text">— / 100 GB</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-sm text-muted">Team Members</span>
            <span className="text-sm text-text">1 / 1</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text mb-1">Need more?</h3>
            <p className="text-sm text-muted">Upgrade to Pro for unlimited projects, team collaboration, and priority support.</p>
          </div>
          <button className="shrink-0 px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
