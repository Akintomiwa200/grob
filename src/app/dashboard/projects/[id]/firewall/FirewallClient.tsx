"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Ban,
  CheckCircle2,
  Save,
  Loader2,
} from "lucide-react";
import {
  toggleWafRule,
  saveIpList,
  toggleDdosProtection,
} from "./actions";

interface WafRule {
  id: string;
  ruleId: string;
  name: string;
  description: string;
  severity: string;
  enabled: boolean;
}

interface IpEntry {
  id: string;
  type: string;
  cidr: string;
}

interface DdosConfig {
  id: string;
  enabled: boolean;
  mitigatedAttacks30d: number;
  peakTrafficBlocked: string;
  lastIncidentAt: string | null;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-error border-red-500/20",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  medium: "bg-blue-500/10 text-info border-blue-500/20",
};

export function FirewallClient({
  projectId,
  projectName,
  wafRules: initialWafRules,
  ipEntries: initialIpEntries,
  ddosConfig: initialDdosConfig,
}: {
  projectId: string;
  projectName: string;
  wafRules: WafRule[];
  ipEntries: IpEntry[];
  ddosConfig: DdosConfig;
}) {
  const [wafRules, setWafRules] = useState<WafRule[]>(initialWafRules);
  const [ddosConfig, setDdosConfig] = useState<DdosConfig>(initialDdosConfig);
  const [allowlistText, setAllowlistText] = useState(
    initialIpEntries
      .filter((e) => e.type === "allow")
      .map((e) => e.cidr)
      .join("\n")
  );
  const [blocklistText, setBlocklistText] = useState(
    initialIpEntries
      .filter((e) => e.type === "block")
      .map((e) => e.cidr)
      .join("\n")
  );
  const [saving, setSaving] = useState<string | null>(null);

  async function handleToggleWaf(ruleId: string, enabled: boolean) {
    setWafRules((prev) =>
      prev.map((r) => (r.ruleId === ruleId ? { ...r, enabled } : r))
    );
    try {
      await toggleWafRule(projectId, ruleId, enabled);
    } catch {
      setWafRules((prev) =>
        prev.map((r) =>
          r.ruleId === ruleId ? { ...r, enabled: !enabled } : r
        )
      );
    }
  }

  async function handleSaveAllowlist() {
    setSaving("allow");
    const cidrs = allowlistText.split("\n").filter((c) => c.trim());
    await saveIpList(projectId, "allow", cidrs);
    setSaving(null);
  }

  async function handleSaveBlocklist() {
    setSaving("block");
    const cidrs = blocklistText.split("\n").filter((c) => c.trim());
    await saveIpList(projectId, "block", cidrs);
    setSaving(null);
  }

  async function handleToggleDdos(enabled: boolean) {
    setDdosConfig({ ...ddosConfig, enabled });
    try {
      await toggleDdosProtection(projectId, enabled);
    } catch {
      setDdosConfig({ ...ddosConfig, enabled: !enabled });
    }
  }

  function formatTimeAgo(date: string | null): string {
    if (!date) return "Never";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Firewall</h2>
        <p className="text-muted text-sm">
          Manage firewall and security rules for{" "}
          <span className="text-text font-medium">{projectName}</span>
        </p>
      </div>

      {/* WAF Rules */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">WAF Rules</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_100px_60px] gap-4 px-5 py-3 border-b border-border text-xs font-medium text-muted uppercase tracking-wider">
            <span>Rule</span>
            <span>Description</span>
            <span>Severity</span>
            <span className="text-right">Enabled</span>
          </div>
          {wafRules.map((rule) => (
            <div
              key={rule.id}
              className="grid grid-cols-[1fr_1fr_100px_60px] gap-4 items-center px-5 py-4 border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text">{rule.name}</p>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {rule.ruleId}
                </p>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {rule.description}
              </p>
              <span
                className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                  SEVERITY_STYLES[rule.severity] || SEVERITY_STYLES.medium
                }`}
              >
                {rule.severity === "critical" && (
                  <AlertTriangle className="w-3 h-3" />
                )}
                {rule.severity}
              </span>
              <div className="flex justify-end">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) =>
                      handleToggleWaf(rule.ruleId, e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IP Allowlist / Blocklist */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">
            IP Allowlist / Blocklist
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <h4 className="text-sm font-medium text-text">IP Allowlist</h4>
            </div>
            <p className="text-xs text-muted mb-3">
              Only these IP addresses can access your project. Leave empty to
              allow all.
            </p>
            <textarea
              rows={5}
              value={allowlistText}
              onChange={(e) => setAllowlistText(e.target.value)}
              placeholder={"192.168.1.0/24\n10.0.0.1\n203.0.113.42"}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
            />
            <button
              onClick={handleSaveAllowlist}
              disabled={saving === "allow"}
              className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving === "allow" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Allowlist
            </button>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Ban className="w-4 h-4 text-error" />
              <h4 className="text-sm font-medium text-text">IP Blocklist</h4>
            </div>
            <p className="text-xs text-muted mb-3">
              These IP addresses will be blocked from accessing your project.
            </p>
            <textarea
              rows={5}
              value={blocklistText}
              onChange={(e) => setBlocklistText(e.target.value)}
              placeholder={"198.51.100.0/24\n45.77.65.211"}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
            />
            <button
              onClick={handleSaveBlocklist}
              disabled={saving === "block"}
              className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving === "block" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Blocklist
            </button>
          </div>
        </div>
      </section>

      {/* DDoS Protection */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">DDoS Protection</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-text">
                    DDoS Mitigation
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                      ddosConfig.enabled
                        ? "bg-green-500/10 text-success border-green-500/20"
                        : "bg-surface text-muted border-border"
                    }`}
                  >
                    {ddosConfig.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  L3/L4 and L7 DDoS protection enabled. Traffic is analyzed in
                  real-time across all edge locations.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ddosConfig.enabled}
                onChange={(e) => handleToggleDdos(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
            <div>
              <p className="text-xs text-muted mb-1">Mitigated Attacks (30d)</p>
              <p className="text-lg font-semibold text-text">
                {ddosConfig.mitigatedAttacks30d.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Peak Traffic Blocked</p>
              <p className="text-lg font-semibold text-text">
                {ddosConfig.peakTrafficBlocked}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Last Incident</p>
              <p className="text-lg font-semibold text-text">
                {formatTimeAgo(ddosConfig.lastIncidentAt)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
