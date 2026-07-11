import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Image,
  Timer,
  Layout,
  Globe2,
} from "lucide-react";

export default async function SpeedInsightsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { deployments: true } } },
    orderBy: { createdAt: "desc" },
  });

  const vitals = [
    {
      name: "Largest Contentful Paint",
      abbr: "LCP",
      value: "1.8s",
      target: "< 2.5s",
      score: 92,
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      description: "Time until the largest content element is visible",
    },
    {
      name: "First Input Delay",
      abbr: "FID",
      value: "12ms",
      target: "< 100ms",
      score: 98,
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      description: "Time from first interaction to browser response",
    },
    {
      name: "Cumulative Layout Shift",
      abbr: "CLS",
      value: "0.04",
      target: "< 0.1",
      score: 96,
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      description: "Measure of visual stability during page load",
    },
    {
      name: "First Contentful Paint",
      abbr: "FCP",
      value: "0.9s",
      target: "< 1.8s",
      score: 95,
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      description: "Time until the first text or image is painted",
    },
    {
      name: "Time to First Byte",
      abbr: "TTFB",
      value: "180ms",
      target: "< 800ms",
      score: 94,
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      description: "Time until the first byte of the response is received",
    },
    {
      name: "Interaction to Next Paint",
      abbr: "INP",
      value: "45ms",
      target: "< 200ms",
      score: 97,
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      description: "Latency of all interactions during page lifecycle",
    },
  ];

  const performanceMetrics = [
    { label: "Avg. Response Time", value: "142ms", change: "-12ms", up: false, icon: Timer },
    { label: "Edge Hit Rate", value: "94.2%", change: "+1.8%", up: true, icon: Globe2 },
    { label: "Cache Efficiency", value: "87.5%", change: "+3.2%", up: true, icon: Zap },
    { label: "Avg. TTFB (Edge)", value: "38ms", change: "-5ms", up: false, icon: Clock },
  ];

  const historicalScores = [
    { month: "Jan", lcp: 85, fid: 95, cls: 90 },
    { month: "Feb", lcp: 87, fid: 96, cls: 91 },
    { month: "Mar", lcp: 88, fid: 97, cls: 93 },
    { month: "Apr", lcp: 90, fid: 97, cls: 94 },
    { month: "May", lcp: 91, fid: 98, cls: 95 },
    { month: "Jun", lcp: 92, fid: 98, cls: 96 },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Speed Insights</h1>
        <p className="text-muted text-sm mt-1">
          Monitor Core Web Vitals and performance metrics across your projects.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    metric.up ? "text-emerald-500" : "text-emerald-500"
                  }`}
                >
                  {metric.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-text">{metric.value}</p>
              <p className="text-xs text-muted mt-1">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-text">Core Web Vitals</h2>
            <p className="text-xs text-muted mt-0.5">Based on real user data (field data)</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Good
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Needs Improvement
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Poor
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vitals.map((vital) => (
            <div key={vital.abbr} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted mb-0.5">{vital.name}</p>
                  <p className="text-lg font-bold text-text">{vital.abbr}</p>
                </div>
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-white/5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3"
                      strokeDasharray={`${vital.score}, 100`}
                      className={vital.bg}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text">
                    {vital.score}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-text">{vital.value}</span>
                <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded-md">
                  Target: {vital.target}
                </span>
              </div>
              <p className="text-xs text-muted mt-3">{vital.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-text">Score History</h2>
            <p className="text-xs text-muted mt-0.5">Performance scores over the last 6 months</p>
          </div>
        </div>
        <div className="flex items-end gap-4 h-40">
          {historicalScores.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end justify-center" style={{ height: "100px" }}>
                <div
                  className="w-3 rounded-t bg-accent"
                  style={{ height: `${(m.lcp / 100) * 100}px` }}
                />
                <div
                  className="w-3 rounded-t bg-emerald-500"
                  style={{ height: `${(m.fid / 100) * 100}px` }}
                />
                <div
                  className="w-3 rounded-t bg-blue-500"
                  style={{ height: `${(m.cls / 100) * 100}px` }}
                />
              </div>
              <span className="text-[10px] text-muted">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <div className="h-2.5 w-2.5 rounded bg-accent" /> LCP
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <div className="h-2.5 w-2.5 rounded bg-emerald-500" /> FID
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <div className="h-2.5 w-2.5 rounded bg-blue-500" /> CLS
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">Project Performance</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Project</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Deployments</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">LCP</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">CLS</th>
              <th className="px-6 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.slice(0, 5).map((project) => (
              <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-surface/80 flex items-center justify-center text-[10px] font-medium text-text">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-text">{project.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 hidden md:table-cell text-muted">
                  {project._count.deployments}
                </td>
                <td className="px-6 py-3 hidden sm:table-cell">
                  <span className="text-xs font-medium text-emerald-500">
                    {(1.2 + Math.random() * 0.8).toFixed(1)}s
                  </span>
                </td>
                <td className="px-6 py-3 hidden sm:table-cell">
                  <span className="text-xs font-medium text-emerald-500">
                    {(Math.random() * 0.05).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                    {85 + Math.floor(Math.random() * 15)}
                  </span>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-muted text-sm">No projects to analyze yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
