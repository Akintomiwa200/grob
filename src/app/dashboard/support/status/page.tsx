import { CheckCircle2, AlertTriangle, XCircle, Clock, Wifi } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "System Status | Support | Grob" };

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  operational: { icon: CheckCircle2, label: "Operational", color: "text-green-500" },
  degraded: { icon: AlertTriangle, label: "Degraded Performance", color: "text-yellow-500" },
  outage: { icon: XCircle, label: "Major Outage", color: "text-red-500" },
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
          {[
            "API Gateway",
            "Build System",
            "Edge Network",
            "DNS Resolution",
            "Database Services",
            "Web Dashboard",
            "Webhooks",
          ].map((name) => {
            const config = STATUS_CONFIG.operational;
            const Icon = config.icon;
            return (
              <div key={name} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm font-medium text-text">{name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className={config.color}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uptime bar */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Uptime (Last 90 Days)</h2>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-end gap-[2px] h-12">
            {Array.from({ length: 90 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-green-500 opacity-80"
                title={`Day ${90 - i}: 100%`}
              />
            ))}
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
        <div className="bg-surface border border-border rounded-xl px-5 py-8 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-muted">No incidents in the last 90 days.</p>
        </div>
      </div>
    </div>
  );
}
