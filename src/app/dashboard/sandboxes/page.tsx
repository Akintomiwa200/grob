"use client";

import { useState } from "react";
import {
  Boxes,
  Plus,
  Play,
  Square,
  Trash2,
  Terminal,
  Settings,
  Copy,
  RefreshCw,
  Clock,
  Cpu,
  HardDrive,
  Globe2,
} from "lucide-react";

type Sandbox = {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped" | "creating";
  cpu: string;
  memory: string;
  uptime: string;
  region: string;
  url: string;
};

export default function SandboxesPage() {
  const sandboxes: Sandbox[] = [
    {
      id: "1",
      name: "frontend-dev",
      image: "node:20-slim",
      status: "running",
      cpu: "0.4 cores",
      memory: "512 MB",
      uptime: "3h 24m",
      region: "US West",
      url: "frontend-dev.sandbox.grob.dev",
    },
    {
      id: "2",
      name: "api-testing",
      image: "python:3.12",
      status: "running",
      cpu: "0.2 cores",
      memory: "256 MB",
      uptime: "1h 12m",
      region: "EU West",
      url: "api-testing.sandbox.grob.dev",
    },
    {
      id: "3",
      name: "data-pipeline",
      image: "node:20-slim",
      status: "stopped",
      cpu: "—",
      memory: "—",
      uptime: "—",
      region: "US West",
      url: "data-pipeline.sandbox.grob.dev",
    },
  ];

  const [activeTab, setActiveTab] = useState<"instances" | "templates">("instances");

  const templates = [
    { name: "Node.js", image: "node:20-slim", description: "Full Node.js development environment" },
    { name: "Python", image: "python:3.12", description: "Python with pip and common libraries" },
    { name: "Go", image: "golang:1.22", description: "Go development sandbox" },
    { name: "Rust", image: "rust:1.77", description: "Rust with Cargo and common tools" },
  ];

  const statusConfig = {
    running: { color: "text-emerald-500", bg: "bg-emerald-500", label: "Running" },
    stopped: { color: "text-muted", bg: "bg-muted", label: "Stopped" },
    creating: { color: "text-amber-500", bg: "bg-amber-500", label: "Creating" },
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Sandboxes</h1>
          <p className="text-muted text-sm mt-1">
            Isolated development environments for testing, prototyping, and debugging.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] self-start">
          <Plus className="h-4 w-4" /> New Sandbox
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Boxes className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{sandboxes.length}</p>
          <p className="text-xs text-muted mt-1">Total Sandboxes</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Play className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {sandboxes.filter((s) => s.status === "running").length}
          </p>
          <p className="text-xs text-muted mt-1">Running</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Cpu className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">0.6</p>
          <p className="text-xs text-muted mt-1">CPU Cores Used</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <HardDrive className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">768 MB</p>
          <p className="text-xs text-muted mt-1">Memory Used</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-border">
        {(["instances", "templates"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "instances" && (
        <div className="space-y-4">
          {sandboxes.map((sandbox) => {
            const status = statusConfig[sandbox.status];
            return (
              <div
                key={sandbox.id}
                className="rounded-xl border border-border bg-surface/20 p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Terminal className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text">{sandbox.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${status.bg}`} />
                          <span className={`text-[10px] font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                        <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded">{sandbox.image}</span>
                        {sandbox.status === "running" && (
                          <>
                            <span className="flex items-center gap-1">
                              <Cpu className="h-3 w-3" /> {sandbox.cpu}
                            </span>
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" /> {sandbox.memory}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {sandbox.uptime}
                            </span>
                          </>
                        )}
                        <span className="flex items-center gap-1">
                          <Globe2 className="h-3 w-3" /> {sandbox.region}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-[11px] font-mono text-accent">{sandbox.url}</code>
                        <button className="p-0.5 rounded text-muted hover:text-text transition-colors">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {sandbox.status === "running" ? (
                      <>
                        <button className="p-1.5 rounded-lg text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
                          <Square className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button className="p-1.5 rounded-lg text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                      <Terminal className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.name}
              className="rounded-xl border border-border bg-surface/20 p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Terminal className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text group-hover:text-accent transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-muted mt-0.5">{template.description}</p>
                  <code className="text-xs font-mono text-muted mt-1 block">{template.image}</code>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors">
                  Create
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
