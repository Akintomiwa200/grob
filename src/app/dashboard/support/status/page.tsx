import { CheckCircle2, AlertTriangle, XCircle, Clock, Wifi } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "System Status | Support | Grob" };

const SERVICES = [
  {
    name: "API Gateway",
    status: "operational",
    uptime: "99.99%",
    latency: "12ms",
  },
  {
    name: "Build System",
    status: "operational",
    uptime: "99.95%",
    latency: "—",
  },
  {
    name: "Edge Network",
    status: "operational",
    uptime: "99.99%",
    latency: "3ms",
  },
  {
    name: "DNS Resolution",
    status: "operational",
    uptime: "100%",
    latency: "5ms",
  },
  {
    name: "Database Services",
    status: "operational",
    uptime: "99.98%",
    latency: "8ms",
  },
  {
    name: "Web Dashboard",
    status: "operational",
    uptime: "99.99%",
    latency: "—",
  },
  {
    name: "Webhooks",
    status: "operational",
    uptime: "99.97%",
    latency: "45ms",
  },
  {
    name: "Live Chat",
    status: "operational",
    uptime: "99.90%",
    latency: "—",
  },
];

const INCIDENTS = [
  {
    date: "2026-07-08",
    title: "Increased build times",
    status: "resolved",
    duration: "1h 23m",
    description:
      "Some builds experienced longer than normal queue times due to high traffic. The issue was resolved by scaling build infrastructure.",
  },
  {
    date: "2026-06-22",
    title: "DNS resolution delays",
    status: "resolved",
    duration: "45m",
    description:
      "A configuration change caused intermittent DNS resolution delays for custom domains. Rolled back and resolved.",
  },
  {
    date: "2026-05-15",
    title: "API rate limiting triggered",
    status: "resolved",
    duration: "20m",
    description:
      "An internal misconfiguration incorrectly triggered rate limits for some Pro accounts. Fixed immediately.",
  },
];

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  operational: { icon: CheckCircle2, label: "Operational", color: "text-green-500" },
  degraded: { icon: AlertTriangle, label: "Degraded Performance", color: "text-yellow-500" },
  outage: { icon: XCircle, label: "Major Outage", color: "text-red-500" },
};

const INCIDENT_STATUS: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  resolved: { icon: CheckCircle2, color: "text-green-500" },
  investigating: { icon: AlertTriangle, color: "text-yellow-500" },
  identified: { icon: Clock, color: "text-blue-500" },
};

export default function SystemStatusPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Wifi className="w-6 h-6 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-text">System Status</h1>
        <p className="text-sm text-muted">
          All systems operational. Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Services</h2>
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
          {SERVICES.map((svc) => {
            const config = STATUS_CONFIG[svc.status] || STATUS_CONFIG.operational;
            const Icon = config.icon;
            return (
              <div key={svc.name} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm font-medium text-text">{svc.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="hidden sm:inline">Uptime: {svc.uptime}</span>
                  {svc.latency !== "—" && (
                    <span className="hidden sm:inline">Latency: {svc.latency}</span>
                  )}
                  <span className={config.color}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uptime bar (90 days mock) */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Uptime (Last 90 Days)</h2>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-end gap-[2px] h-12">
            {Array.from({ length: 90 }, (_, i) => {
              const colors = ["bg-green-500", "bg-green-500", "bg-green-500", "bg-yellow-500"];
              const weight = i < 85 ? 0 : i < 88 ? 1 : 0;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${colors[weight]} opacity-80`}
                  title={`Day ${90 - i}: ${weight === 0 ? "100%" : "99.95%"}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Past incidents */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Past Incidents</h2>
        <div className="space-y-3">
          {INCIDENTS.map((inc, i) => {
            const config = INCIDENT_STATUS[inc.status] || INCIDENT_STATUS.resolved;
            const Icon = config.icon;
            return (
              <div key={i} className="bg-surface border border-border rounded-xl px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm font-medium text-text">{inc.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>{inc.duration}</span>
                    <span>·</span>
                    <span>{inc.date}</span>
                  </div>
                </div>
                <p className="text-sm text-muted">{inc.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
