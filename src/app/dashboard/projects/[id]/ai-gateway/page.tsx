import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Activity,
  Cpu,
  Zap,
  AlertTriangle,
  Clock,
  Key,
  Copy,
  Trash2,
  Save,
} from "lucide-react";

const GATEWAY_STATS = [
  {
    label: "Total Requests",
    value: "12,847",
    change: "+12.3%",
    icon: Activity,
    color: "text-info",
  },
  {
    label: "Avg Latency",
    value: "245ms",
    change: "-8.1%",
    icon: Clock,
    color: "text-success",
  },
  {
    label: "Error Rate",
    value: "0.3%",
    change: "-0.2%",
    icon: AlertTriangle,
    color: "text-warning",
  },
];

const AI_MODELS = [
  {
    id: "gpt-4",
    name: "gpt-4",
    provider: "OpenAI",
    status: "active",
    rateLimit: "10,000 req/min",
    costPer1k: "$0.03",
  },
  {
    id: "claude-3-sonnet",
    name: "claude-3-sonnet",
    provider: "Anthropic",
    status: "active",
    rateLimit: "5,000 req/min",
    costPer1k: "$0.015",
  },
  {
    id: "llama-3",
    name: "llama-3",
    provider: "Meta",
    status: "rate_limited",
    rateLimit: "2,000 req/min",
    costPer1k: "$0.002",
  },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/10 text-success border-green-500/20",
  rate_limited: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  inactive: "bg-muted/10 text-muted border-border",
};

export default async function AiGatewayPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const maskedKey = "sk-grob-****-****-****-7f3a";

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">AI Gateway</h2>
        <p className="text-muted text-sm">
          Manage AI model gateway for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Gateway Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Gateway Statistics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GATEWAY_STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xs text-muted font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-text">{stat.value}</p>
                <span className="text-xs text-success font-medium mb-1">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Models */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Models</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_140px_100px_80px] gap-4 px-5 py-3 border-b border-border text-xs font-medium text-muted uppercase tracking-wider">
            <span>Model</span>
            <span>Status</span>
            <span>Rate Limit</span>
            <span>Cost/1K tokens</span>
            <span className="text-right">Enabled</span>
          </div>
          {AI_MODELS.map((model) => (
            <div
              key={model.id}
              className="grid grid-cols-[1fr_100px_140px_100px_80px] gap-4 items-center px-5 py-4 border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text">{model.name}</p>
                <p className="text-[10px] text-muted">{model.provider}</p>
              </div>
              <span
                className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                  STATUS_STYLES[model.status]
                }`}
              >
                {model.status === "active" ? "Active" : "Rate Limited"}
              </span>
              <span className="text-xs text-muted font-mono">{model.rateLimit}</span>
              <span className="text-sm font-medium text-text">{model.costPer1k}</span>
              <div className="flex justify-end">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={model.status === "active"}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rate Limiting */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Rate Limiting</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Requests per Minute
              </label>
              <input
                type="number"
                defaultValue={100}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Burst Limit
              </label>
              <input
                type="number"
                defaultValue={200}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
          </div>
          <button className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
            <Save className="w-4 h-4" />
            Save Rate Limits
          </button>
        </div>
      </section>

      {/* API Keys */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">API Keys</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <p className="text-xs text-muted">
            Use API keys to authenticate requests to the AI gateway.
          </p>
          <div className="flex items-center justify-between bg-bg border border-border rounded-lg px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Key className="w-4 h-4 text-muted shrink-0" />
              <code className="text-xs text-text font-mono">{maskedKey}</code>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.05] transition-colors"
                title="Copy API key"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-red-500/10 transition-colors"
                title="Delete API key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
            <Key className="w-4 h-4" />
            Generate New Key
          </button>
        </div>
      </section>
    </div>
  );
}
