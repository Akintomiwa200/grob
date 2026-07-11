import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Bot, ArrowLeft, Play, Pause, Trash2, Settings, Terminal, Cpu, Zap, Copy } from "lucide-react";
import Link from "next/link";

export default async function AgentDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  const agentData: Record<string, { name: string; desc: string; model: string; capabilities: string[] }> = {
    "deploy-bot": { name: "Deploy Bot", desc: "Automates deployments with AI-powered review and rollback suggestions.", model: "gpt-4o", capabilities: ["Auto-deploy on push", "Rollback suggestions", "Build failure analysis"] },
    "chat-support": { name: "Chat Support Agent", desc: "Handles initial triage of support tickets and common issues.", model: "claude-3.5-sonnet", capabilities: ["Ticket classification", "Auto-response", "Escalation routing"] },
    "code-review": { name: "Code Review Agent", desc: "Reviews pull requests and provides suggestions for improvements.", model: "gpt-4o", capabilities: ["PR review", "Security scanning", "Code quality checks"] },
  };

  const data = agentData[id] || { name: `Agent ${id.slice(0, 6)}`, desc: "Custom AI agent", model: "gpt-4o", capabilities: [] };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/agent" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to AI Agent
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text">{data.name}</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Ready</span>
            </div>
            <p className="text-muted text-sm mt-1">{data.desc}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-1.5"><Play className="h-4 w-4" /> Deploy</button>
            <button className="px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5"><Trash2 className="h-4 w-4" /> Delete</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Model</p><p className="text-sm font-medium text-text">{data.model}</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Status</p><p className="text-sm font-medium text-emerald-500">Ready</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Total Actions</p><p className="text-sm font-medium text-text">0</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Last Active</p><p className="text-sm font-medium text-text">Never</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Model</label>
              <select defaultValue={data.model} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="llama-3.1-70b">Llama 3.1 70B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Temperature</label>
              <input type="range" min="0" max="100" defaultValue="30" className="w-full accent-accent" />
              <div className="flex justify-between text-xs text-muted"><span>Precise</span><span>Creative</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Max Tokens</label>
              <input defaultValue="4096" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">System Prompt</label>
              <textarea rows={4} defaultValue="You are a helpful deployment assistant." className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono" />
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Save Configuration</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Capabilities</h2>
          <div className="space-y-2 mb-6">
            {data.capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-2 p-2 rounded-lg bg-surface/30 border border-border">
                <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-sm text-text">{cap}</span>
              </div>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-text mb-3">Recent Activity</h3>
          <div className="p-8 rounded-lg border border-dashed border-border text-center">
            <Terminal className="h-6 w-6 text-muted mx-auto mb-2" />
            <p className="text-xs text-muted">No activity yet. Deploy the agent to get started.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
