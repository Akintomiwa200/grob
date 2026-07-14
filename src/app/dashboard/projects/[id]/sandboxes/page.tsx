import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Container,
  Plus,
  Play,
  Square,
  Trash2,
  Clock,
  Cpu,
} from "lucide-react";

const SANDBOXES = [
  {
    id: "sb-1",
    name: "dev-sandbox",
    status: "running",
    environment: "Node.js 20",
    lastActive: "2 minutes ago",
  },
  {
    id: "sb-2",
    name: "ml-experiment",
    status: "stopped",
    environment: "Python 3.12",
    lastActive: "3 hours ago",
  },
  {
    id: "sb-3",
    name: "api-staging",
    status: "running",
    environment: "Go 1.22",
    lastActive: "12 minutes ago",
  },
];

const STATUS_STYLES: Record<string, { color: string; dot: string }> = {
  running: {
    color: "bg-green-500/10 text-success border-green-500/20",
    dot: "bg-success",
  },
  stopped: {
    color: "bg-muted/10 text-muted border-border",
    dot: "bg-muted",
  },
};

const ENV_COLORS: Record<string, string> = {
  "Node.js 20": "bg-green-500/10 text-green-500",
  "Python 3.12": "bg-blue-500/10 text-blue-500",
  "Go 1.22": "bg-cyan-500/10 text-cyan-500",
};

export default async function SandboxesPage(props: {
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
        <h2 className="text-xl font-semibold text-text mb-1">Sandboxes</h2>
        <p className="text-muted text-sm">
          Manage development sandboxes for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Sandbox Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SANDBOXES.map((sandbox) => {
            const statusStyle = STATUS_STYLES[sandbox.status];
            const envColor = ENV_COLORS[sandbox.environment] || "bg-muted/10 text-muted";
            return (
              <div
                key={sandbox.id}
                className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-text">
                      {sandbox.name}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusStyle.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                      />
                      {sandbox.status === "running" ? "Running" : "Stopped"}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${envColor}`}
                  >
                    {sandbox.environment}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted mb-4">
                  <Clock className="w-3 h-3" />
                  <span>Last active: {sandbox.lastActive}</span>
                </div>
                <div className="flex items-center gap-2 border-t border-border pt-3">
                  {sandbox.status === "running" ? (
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-muted bg-bg border border-border rounded-lg hover:bg-white/[0.03] transition-colors">
                      <Square className="w-3 h-3" />
                      Stop
                    </button>
                  ) : (
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-success bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors">
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}
                  <button className="flex items-center justify-center p-2 text-muted hover:text-error hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Create Sandbox */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Create Sandbox</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Sandbox Name
              </label>
              <input
                placeholder="my-sandbox"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">
                Environment
              </label>
              <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors">
                <option>Node.js 20</option>
                <option>Python 3.12</option>
                <option>Go 1.22</option>
                <option>Rust 1.76</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
                <Container className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
