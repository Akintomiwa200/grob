import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LineChart, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Analytics</h1>
        <p className="text-muted text-sm mt-1">Deep insights into your traffic, users, and engagement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-3">
            <LineChart className="h-5 w-5 text-accent" />
          </div>
          <h3 className="font-semibold text-text mb-1">Overview</h3>
          <p className="text-sm text-muted">Get a comprehensive view of your analytics configuration and status.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 mb-3">
            <LineChart className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-text mb-1">Configuration</h3>
          <p className="text-sm text-muted">Configure settings, rules, and preferences for your analytics.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 mb-3">
            <LineChart className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-text mb-1">Monitoring</h3>
          <p className="text-sm text-muted">Track usage, alerts, and performance metrics in real time.</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20 border border-border bg-surface/30 rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 ring-1 ring-accent/20">
          <Sparkles className="w-8 h-8 text-accent" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">Analytics is coming soon</h2>
        <p className="text-muted text-sm max-w-md text-center mb-8">
          We are working on real-time dashboards, user behavior tracking, and performance metrics. Check back soon or read our documentation to learn more.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard" className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
            Back to Dashboard
          </Link>
          <a href="#" className="px-5 py-2.5 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:bg-white/[0.05] transition-colors">
            Read Documentation
          </a>
        </div>
      </div>
    </div>
  );
}