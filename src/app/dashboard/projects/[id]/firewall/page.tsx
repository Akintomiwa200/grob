import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Ban,
  CheckCircle2,
  Save,
} from "lucide-react";

const WAF_RULES = [
  {
    id: "sql-injection",
    name: "Block SQL Injection",
    description: "Detects and blocks common SQL injection patterns in requests",
    severity: "critical",
    enabled: true,
  },
  {
    id: "rate-limiting",
    name: "Rate Limiting",
    description: "Limits request rate to 100 req/min per IP address",
    severity: "warning",
    enabled: true,
  },
  {
    id: "bot-protection",
    name: "Bot Protection",
    description: "Blocks known malicious bots and scrapers via user-agent analysis",
    severity: "medium",
    enabled: false,
  },
];

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-error border-red-500/20",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  medium: "bg-blue-500/10 text-info border-blue-500/20",
};

export default async function FirewallPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Firewall</h2>
        <p className="text-muted text-sm">
          Manage firewall and security rules for{" "}
          <span className="text-text font-medium">{project.name}</span>
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
          {WAF_RULES.map((rule) => (
            <div
              key={rule.id}
              className="grid grid-cols-[1fr_1fr_100px_60px] gap-4 items-center px-5 py-4 border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text">{rule.name}</p>
                <p className="text-xs text-muted font-mono mt-0.5">{rule.id}</p>
              </div>
              <p className="text-xs text-muted leading-relaxed">{rule.description}</p>
              <span
                className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                  SEVERITY_STYLES[rule.severity]
                }`}
              >
                {rule.severity === "critical" && <AlertTriangle className="w-3 h-3" />}
                {rule.severity}
              </span>
              <div className="flex justify-end">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={rule.enabled}
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
              placeholder={"192.168.1.0/24\n10.0.0.1\n203.0.113.42"}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
            />
            <button className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
              <Save className="w-4 h-4" />
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
              placeholder={"198.51.100.0/24\n45.77.65.211"}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
            />
            <button className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
              <Save className="w-4 h-4" />
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
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-success border border-green-500/20">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  L3/L4 and L7 DDoS protection enabled. Traffic is analyzed in
                  real-time across all edge locations.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
            <div>
              <p className="text-xs text-muted mb-1">Mitigated Attacks (30d)</p>
              <p className="text-lg font-semibold text-text">1,247</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Peak Traffic Blocked</p>
              <p className="text-lg font-semibold text-text">12.4 Gbps</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Last Incident</p>
              <p className="text-lg font-semibold text-text">3 days ago</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
