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
import Link from "next/link";

type FirewallRule = {
  id: string;
  name: string;
  type: "block" | "allow" | "rate-limit" | "challenge";
  target: string;
  description: string;
  enabled: boolean;
};

export default function FirewallPage() {
  const [rules, setRules] = useState<FirewallRule[]>([]);

  const [showNewRule, setShowNewRule] = useState(false);

  const stats = [
    { label: "Blocked Requests (24h)", value: "—", icon: Ban, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Active Rules", value: rules.filter((r) => r.enabled).length.toString(), icon: ShieldHalf, color: "text-accent", bg: "bg-accent/10" },
    { label: "Challenged Requests", value: "—", icon: Lock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Rate Limited", value: "—", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
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
        {rules.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface/20 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mx-auto mb-4">
              <ShieldHalf className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-text mb-1">No firewall rules</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mb-4">
              Create rules to block bad bots, rate-limit API endpoints, and challenge suspicious traffic.
            </p>
            <button
              onClick={() => setShowNewRule(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-all"
            >
              <Plus className="h-4 w-4" /> Create Rule
            </button>
          </div>
        ) : (
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
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">Blocked IP Addresses</h2>
          <button className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors">
            <Plus className="h-3 w-3" /> Add IP
          </button>
        </div>
        <div className="text-center py-8">
          <Ban className="h-5 w-5 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">No blocked IP addresses</p>
        </div>
      </div>
    </div>
  );
}
