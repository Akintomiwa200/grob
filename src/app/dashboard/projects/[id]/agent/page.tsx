import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Bot,
  BrainCircuit,
  Sliders,
  Code2,
  FileText,
  FlaskConical,
  CheckCircle2,
  Save,
} from "lucide-react";

export default async function AgentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const models = [
    "GPT-4 Turbo",
    "GPT-4o",
    "Claude 3 Opus",
    "Claude 3.5 Sonnet",
    "Llama 3 70B",
    "Gemini Pro",
  ];

  const capabilities = [
    {
      id: "code_generation",
      label: "Code Generation",
      description: "Generate code from natural language descriptions",
      icon: Code2,
      defaultChecked: true,
    },
    {
      id: "code_review",
      label: "Code Review",
      description: "Automated code review with suggestions and fixes",
      icon: FileText,
      defaultChecked: true,
    },
    {
      id: "documentation",
      label: "Documentation",
      description: "Generate and maintain project documentation",
      icon: FileText,
      defaultChecked: false,
    },
    {
      id: "test_generation",
      label: "Test Generation",
      description: "Create unit and integration tests automatically",
      icon: FlaskConical,
      defaultChecked: true,
    },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">AI Agent</h2>
          <p className="text-muted text-sm">
            Configure the AI coding agent for{" "}
            <span className="text-text font-medium">{project.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">Ready</span>
        </div>
      </div>

      {/* Model Selection */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Model Selection</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <label className="block text-xs text-muted mb-1.5">
            Default Model
          </label>
          <select className="w-full max-w-md px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors">
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* System Prompt */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">System Prompt</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <label className="block text-xs text-muted mb-1.5">
            Instructions for the AI agent
          </label>
          <textarea
            rows={8}
            defaultValue={`You are a senior software engineer AI assistant. You help with:
- Writing clean, production-quality code
- Debugging and fixing issues
- Code review with best practices
- Writing comprehensive tests
- Creating clear documentation

Always follow the project's existing conventions and patterns.
When uncertain, ask clarifying questions before proceeding.`}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
          />
        </div>
      </section>

      {/* Parameters */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Parameters</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted">Temperature</label>
                <span className="text-xs text-text font-mono font-medium">
                  0.7
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>Precise (0)</span>
                <span>Creative (1)</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Max Tokens
              </label>
              <input
                type="number"
                defaultValue={4096}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Capabilities</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          {capabilities.map((cap) => (
            <label
              key={cap.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center">
                  <cap.icon className="w-4 h-4 text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{cap.label}</p>
                  <p className="text-xs text-muted">{cap.description}</p>
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked={cap.defaultChecked}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent/50 bg-bg cursor-pointer"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      </div>
    </div>
  );
}
