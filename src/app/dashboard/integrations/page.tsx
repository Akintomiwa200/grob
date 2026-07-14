"use client";

import { useState } from "react";
import {
  Blocks,
  Search,
  CheckCircle2,
  Plus,
  ExternalLink,
  GitBranch,
  MessageSquare,
  Mail,
  Webhook,
  Bell,
  Cloud,
  Database,
} from "lucide-react";

type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  bg: string;
  connected: boolean;
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const integrations: Integration[] = [
    {
      id: "github",
      name: "GitHub",
      description: "Automatic deployments from GitHub repositories with commit status checks.",
      category: "Version Control",
      icon: GitBranch,
      color: "text-text",
      bg: "bg-white/10",
      connected: true,
    },
    {
      id: "gitlab",
      name: "GitLab",
      description: "Connect GitLab repositories for CI/CD pipeline integration.",
      category: "Version Control",
      icon: GitBranch,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      connected: false,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get deployment notifications and alerts in your Slack channels.",
      category: "Notifications",
      icon: MessageSquare,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      connected: false,
    },
    {
      id: "discord",
      name: "Discord",
      description: "Send deployment updates and alerts to your Discord server.",
      category: "Notifications",
      icon: MessageSquare,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      connected: false,
    },
    {
      id: "email",
      name: "Email Notifications",
      description: "Receive email alerts for deployments, errors, and billing events.",
      category: "Notifications",
      icon: Mail,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      connected: true,
    },
    {
      id: "webhooks",
      name: "Custom Webhooks",
      description: "Trigger custom HTTP endpoints on deployment events.",
      category: "Automation",
      icon: Webhook,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      connected: false,
    },
    {
      id: "sentry",
      name: "Sentry",
      description: "Track and monitor frontend and backend errors in real-time.",
      category: "Monitoring",
      icon: Cloud,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      connected: false,
    },
    {
      id: "datadog",
      name: "Datadog",
      description: "Export metrics and logs to Datadog for advanced monitoring.",
      category: "Monitoring",
      icon: Database,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      connected: false,
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Migrate projects from Vercel with zero-downtime deployment sync.",
      category: "Migration",
      icon: Cloud,
      color: "text-text",
      bg: "bg-white/10",
      connected: false,
    },
  ];

  const categories = ["all", ...new Set(integrations.map((i) => i.category))];

  const filtered = integrations.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || i.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Integrations</h1>
          <p className="text-muted text-sm mt-1">
            Connect Grob with your favorite tools and services.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] self-start">
          <Plus className="h-4 w-4" /> Browse Marketplace
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface/30 pl-10 pr-4 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="sidebar-scroll flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeCategory === cat
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-text hover:bg-white/5"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.id}
              className="rounded-xl border border-border bg-surface/20 p-5 hover:bg-white/[0.02] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${integration.bg}`}>
                    <Icon className={`h-5 w-5 ${integration.color}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{integration.name}</h3>
                    <p className="text-[10px] text-muted">{integration.category}</p>
                  </div>
                </div>
                {integration.connected && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted mb-4">{integration.description}</p>
              <div className="flex items-center gap-2">
                <button
                  className={`flex-1 text-center px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    integration.connected
                      ? "bg-white/5 text-text hover:bg-white/10 border border-border"
                      : "bg-accent text-white hover:bg-accent/90"
                  }`}
                >
                  {integration.connected ? "Configure" : "Connect"}
                </button>
                <button className="p-2 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border border-border bg-surface/30 rounded-2xl">
          <Blocks className="h-8 w-8 text-muted mb-3" />
          <p className="text-sm text-muted">No integrations found matching your search.</p>
        </div>
      )}
    </div>
  );
}
