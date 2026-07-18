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

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "agent"; content: string }[]>([]);

  const capabilities = [
    { name: "Code Generation", icon: Code, description: "Generate functions, components, and full modules" },
    { name: "Documentation", icon: FileText, description: "Write README, API docs, and inline comments" },
    { name: "Debugging", icon: Zap, description: "Identify and fix bugs in your code" },
    { name: "Refactoring", icon: Sparkles, description: "Improve code quality and performance" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      {
        role: "agent",
        content: "AI Agent is not yet configured. Connect an AI provider in Settings to enable agent capabilities.",
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
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
                  <Bot className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-text mb-1">No agents configured</h3>
                <p className="text-xs text-muted max-w-sm">
                  Create an agent or connect an AI provider in Settings to start automating tasks.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
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
              ))
            )}
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
      <div className="rounded-xl border border-border bg-surface/20 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mx-auto mb-4">
          <Bot className="h-7 w-7 text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-text mb-1">No agents created</h3>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Create an AI agent to automate code generation, documentation, testing, and more.
        </p>
      </div>
    </div>
  );
}
