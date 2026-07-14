"use client";

import { useState } from "react";
import {
  Bot,
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  Send,
  Zap,
  Code,
  FileText,
  Sparkles,
  Copy,
  Play,
  Square,
  RotateCcw,
} from "lucide-react";

type Agent = {
  id: string;
  name: string;
  description: string;
  model: string;
  status: "active" | "inactive";
  tasks: number;
  lastUsed: string;
};

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "agent"; content: string }[]>([
    {
      role: "agent",
      content:
        "Hello! I'm your AI Agent. I can help you generate code, write documentation, debug issues, and automate tasks across your projects. What would you like to work on?",
    },
  ]);

  const agents: Agent[] = [
    {
      id: "1",
      name: "Code Assistant",
      description: "Generates boilerplate, refactors code, and suggests improvements.",
      model: "gpt-4o",
      status: "active",
      tasks: 142,
      lastUsed: "2 hours ago",
    },
    {
      id: "2",
      name: "Documentation Writer",
      description: "Creates and maintains project documentation, READMEs, and API docs.",
      model: "gpt-4o-mini",
      status: "active",
      tasks: 38,
      lastUsed: "1 day ago",
    },
    {
      id: "3",
      name: "Test Generator",
      description: "Writes unit tests and integration tests for your codebase.",
      model: "gpt-4o",
      status: "inactive",
      tasks: 12,
      lastUsed: "1 week ago",
    },
  ];

  const capabilities = [
    { name: "Code Generation", icon: Code, description: "Generate functions, components, and full modules" },
    { name: "Documentation", icon: FileText, description: "Write README, API docs, and inline comments" },
    { name: "Debugging", icon: Zap, description: "Identify and fix bugs in your code" },
    { name: "Refactoring", icon: Sparkles, description: "Improve code quality and performance" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      {
        role: "agent",
        content:
          "I'm analyzing your request. In a production environment, I would process this with the configured AI model and return relevant results based on your codebase context.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">AI Agent</h1>
          <p className="text-muted text-sm mt-1">
            Automate tasks with AI-powered agents that work across your projects.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] self-start">
          <Plus className="h-4 w-4" /> New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-text text-sm">Agent Playground</h3>
                <p className="text-[10px] text-muted">Chat with your AI agent</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="sidebar-scroll h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-accent text-white"
                      : "bg-white/5 text-text border border-border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask the agent anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 rounded-xl border border-border bg-surface/30 px-4 py-2.5 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={handleSend}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface/20 p-5">
            <h3 className="font-semibold text-text mb-3">Capabilities</h3>
            <div className="space-y-3">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.name} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{cap.name}</p>
                      <p className="text-xs text-muted">{cap.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/20 p-5">
            <h3 className="font-semibold text-text mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                "Generate a new React component",
                "Write unit tests for a file",
                "Refactor selected code",
                "Explain this error message",
              ].map((action) => (
                <button
                  key={action}
                  onClick={() => setInput(action)}
                  className="w-full text-left px-3 py-2 text-xs text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold text-text mb-4">Your Agents</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-xl border border-border bg-surface/20 p-5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-2 w-2 rounded-full ${
                    agent.status === "active" ? "bg-emerald-500" : "bg-muted"
                  }`}
                />
                <span className="text-[10px] text-muted capitalize">{agent.status}</span>
              </div>
            </div>
            <h3 className="font-semibold text-text mb-1">{agent.name}</h3>
            <p className="text-xs text-muted mb-3">{agent.description}</p>
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded">{agent.model}</span>
              <span>{agent.tasks} tasks</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-text bg-white/5 border border-border rounded-lg hover:bg-white/10 transition-colors">
                <Play className="h-3 w-3" /> Run
              </button>
              <button className="p-2 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
