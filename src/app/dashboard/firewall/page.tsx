"use client";

import { useState } from "react";
import {
  ShieldHalf,
  Plus,
  Globe2,
  Ban,
  Clock,
  Lock,
  Settings,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

type FirewallRule = {
  id: string;
  name: string;
  type: "block" | "allow" | "rate-limit" | "challenge";
  target: string;
  description: string;
  enabled: boolean;
};

export default function FirewallPage() {
  const [rules, setRules] = useState<FirewallRule[]>([
    {
      id: "1",
      name: "Block Known Bad Bots",
      type: "block",
      target: "User-Agent Pattern",
      description: "Blocks requests from known malicious bot patterns and scrapers.",
      enabled: true,
    },
    {
      id: "2",
      name: "Rate Limit API Endpoints",
      type: "rate-limit",
      target: "/api/*",
      description: "Limits to 100 requests per minute per IP address.",
      enabled: true,
    },
    {
      id: "3",
      name: "Challenge Suspicious Traffic",
      type: "challenge",
      target: "Geographic Filter",
      description: "JS challenge for traffic from regions with high fraud rates.",
      enabled: false,
    },
  ]);

  const [showNewRule, setShowNewRule] = useState(false);

  const blockedIPs = [
    { ip: "185.220.101.42", reason: "Repeated 403 errors", added: "2 days ago" },
    { ip: "103.152.118.71", reason: "SQL injection attempts", added: "5 days ago" },
    { ip: "91.134.203.18", reason: "DDoS participant", added: "1 week ago" },
  ];

  const stats = [
    { label: "Blocked Requests (24h)", value: "2,847", icon: Ban, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Active Rules", value: rules.filter((r) => r.enabled).length.toString(), icon: ShieldHalf, color: "text-accent", bg: "bg-accent/10" },
    { label: "Challenged Requests", value: "412", icon: Lock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Rate Limited", value: "156", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Firewall</h1>
          <p className="text-muted text-sm mt-1">
            Protect your applications with WAF rules, IP blocking, and rate limiting.
          </p>
        </div>
        <button
          onClick={() => setShowNewRule(!showNewRule)}
          className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Add Rule
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
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

      {showNewRule && (
        <div className="mb-8 rounded-xl border border-accent/30 bg-accent/5 p-6">
          <h3 className="font-semibold text-text mb-4">Create Firewall Rule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Rule Name</label>
              <input
                type="text"
                placeholder="e.g., Block specific path"
                className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Rule Type</label>
              <select className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none">
                <option>Block</option>
                <option>Allow</option>
                <option>Rate Limit</option>
                <option>Challenge</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Target</label>
              <input
                type="text"
                placeholder="e.g., /api/*, IP range, or User-Agent"
                className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Description</label>
              <input
                type="text"
                placeholder="Optional description"
                className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
              Create Rule
            </button>
            <button
              onClick={() => setShowNewRule(false)}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-semibold text-text mb-4">Firewall Rules</h2>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-border bg-surface/20 p-5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      rule.type === "block"
                        ? "bg-red-500/10"
                        : rule.type === "rate-limit"
                        ? "bg-blue-500/10"
                        : rule.type === "challenge"
                        ? "bg-amber-500/10"
                        : "bg-emerald-500/10"
                    }`}
                  >
                    {rule.type === "block" ? (
                      <Ban className="h-5 w-5 text-red-500" />
                    ) : rule.type === "rate-limit" ? (
                      <Clock className="h-5 w-5 text-blue-500" />
                    ) : rule.type === "challenge" ? (
                      <Lock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <ShieldHalf className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text">{rule.name}</h3>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          rule.type === "block"
                            ? "bg-red-500/10 text-red-500"
                            : rule.type === "rate-limit"
                            ? "bg-blue-500/10 text-blue-500"
                            : rule.type === "challenge"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {rule.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">Target: {rule.target}</p>
                    <p className="text-sm text-muted mt-1">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {rule.enabled ? (
                      <ToggleRight className="h-6 w-6 text-accent" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-muted" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">Blocked IP Addresses</h2>
          <button className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors">
            <Plus className="h-3 w-3" /> Add IP
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">IP Address</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Reason</th>
              <th className="px-4 py-2 font-medium hidden md:table-cell">Added</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {blockedIPs.map((ip) => (
              <tr key={ip.ip} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-text">{ip.ip}</td>
                <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">{ip.reason}</td>
                <td className="px-4 py-3 text-xs text-muted hidden md:table-cell">{ip.added}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-muted hover:text-red-500 transition-colors">
                    Unblock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
