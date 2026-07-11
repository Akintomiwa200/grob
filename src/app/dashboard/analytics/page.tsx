import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  LineChart,
  Users,
  Eye,
  Globe2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const projectCount = await prisma.project.count({
    where: { userId: session.user.id },
  });
  const deploymentCount = await prisma.deployment.count({
    where: { project: { userId: session.user.id } },
  });
  const successCount = await prisma.deployment.count({
    where: { project: { userId: session.user.id }, status: "success" },
  });
  const domainCount = await prisma.domain.count({
    where: { project: { userId: session.user.id } },
  });

  const stats = [
    {
      label: "Total Visits",
      value: "12,847",
      change: "+14.2%",
      up: true,
      icon: Eye,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Unique Visitors",
      value: "4,321",
      change: "+8.1%",
      up: true,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Top Countries",
      value: "28",
      change: "+3",
      up: true,
      icon: Globe2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Avg. Session",
      value: "3m 42s",
      change: "-0.5%",
      up: false,
      icon: BarChart3,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  const trafficData = [
    { day: "Mon", visits: 1200 },
    { day: "Tue", visits: 1800 },
    { day: "Wed", visits: 1500 },
    { day: "Thu", visits: 2200 },
    { day: "Fri", visits: 1900 },
    { day: "Sat", visits: 800 },
    { day: "Sun", visits: 600 },
  ];
  const maxVisits = Math.max(...trafficData.map((d) => d.visits));

  const topPages = [
    { path: "/", views: 4521, percentage: 35 },
    { path: "/pricing", views: 2130, percentage: 17 },
    { path: "/docs/getting-started", views: 1847, percentage: 14 },
    { path: "/blog", views: 1203, percentage: 9 },
    { path: "/dashboard", views: 987, percentage: 8 },
  ];

  const topReferrers = [
    { source: "Google", visits: 3241 },
    { source: "GitHub", visits: 1892 },
    { source: "Twitter / X", visits: 1103 },
    { source: "Direct", visits: 892 },
    { source: "Hacker News", visits: 421 },
  ];

  const recentActivity = [
    { event: "Traffic spike detected on /pricing", time: "2 hours ago", type: "alert" },
    { event: "New top country: Brazil (12% of traffic)", time: "5 hours ago", type: "info" },
    { event: "Page load time increased by 0.3s", time: "1 day ago", type: "warning" },
    { event: "Weekly report generated", time: "2 days ago", type: "info" },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Analytics</h1>
          <p className="text-muted text-sm mt-1">
            Deep insights into your traffic, users, and engagement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="rounded-xl border border-border bg-surface/30 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    stat.up ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {stat.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-text">Traffic Overview</h2>
              <p className="text-xs text-muted mt-1">Visits per day this week</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              +14.2% vs last week
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {trafficData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-muted font-medium">
                  {d.visits > 999 ? `${(d.visits / 1000).toFixed(1)}k` : d.visits}
                </span>
                <div className="w-full relative group">
                  <div
                    className="w-full rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors"
                    style={{ height: `${(d.visits / maxVisits) * 120}px` }}
                  />
                </div>
                <span className="text-[10px] text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="font-semibold text-text mb-1">Active Projects</h2>
          <p className="text-xs text-muted mb-6">Across your workspace</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Projects</span>
              <span className="text-sm font-semibold text-text">{projectCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Deployments</span>
              <span className="text-sm font-semibold text-text">{deploymentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Success Rate</span>
              <span className="text-sm font-semibold text-emerald-500">
                {deploymentCount
                  ? `${Math.round((successCount / deploymentCount) * 100)}%`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Custom Domains</span>
              <span className="text-sm font-semibold text-text">{domainCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="font-semibold text-text mb-4">Top Pages</h2>
          <div className="space-y-4">
            {topPages.map((page) => (
              <div key={page.path} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-mono text-text group-hover:text-accent transition-colors">
                    {page.path}
                  </span>
                  <span className="text-xs text-muted">{page.views.toLocaleString()} views</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent/60 rounded-full"
                    style={{ width: `${page.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="font-semibold text-text mb-4">Top Referrers</h2>
          <div className="space-y-3">
            {topReferrers.map((ref, i) => (
              <div
                key={ref.source}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted w-4">{i + 1}.</span>
                  <span className="text-sm text-text">{ref.source}</span>
                </div>
                <span className="text-sm text-muted">{ref.visits.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <h2 className="font-semibold text-text mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${
                    activity.type === "alert"
                      ? "bg-amber-500"
                      : activity.type === "warning"
                      ? "bg-orange-500"
                      : "bg-accent"
                  }`}
                />
                <span className="text-sm text-text">{activity.event}</span>
              </div>
              <span className="text-xs text-muted">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
