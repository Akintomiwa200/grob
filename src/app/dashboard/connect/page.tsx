import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Cable,
  Database,
  Server,
  Globe2,
  CheckCircle2,
  Plus,
  ArrowRight,
  Settings,
  Zap,
} from "lucide-react";

export default async function ConnectPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { deployments: true, envVars: true } } },
    orderBy: { createdAt: "desc" },
  });

  const connectionTypes = [
    {
      name: "PostgreSQL",
      description: "Connect to a managed PostgreSQL database for persistent data storage.",
      icon: Database,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      status: "available",
    },
    {
      name: "Redis",
      description: "In-memory data store for caching, sessions, and real-time features.",
      icon: Server,
      color: "text-red-500",
      bg: "bg-red-500/10",
      status: "available",
    },
    {
      name: "MongoDB",
      description: "NoSQL document database for flexible data models and rapid prototyping.",
      icon: Database,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      status: "available",
    },
    {
      name: "External APIs",
      description: "Connect to third-party REST or GraphQL APIs with built-in proxying.",
      icon: Globe2,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      status: "available",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Connect</h1>
          <p className="text-muted text-sm mt-1">
            Connect your projects to databases, APIs, and external services.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent self-start">
          Beta
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {connectionTypes.map((conn) => {
          const Icon = conn.icon;
          return (
            <div
              key={conn.name}
              className="rounded-xl border border-border bg-surface/20 p-6 hover:bg-white/[0.02] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${conn.bg}`}>
                    <Icon className={`h-6 w-6 ${conn.color}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text group-hover:text-accent transition-colors">
                      {conn.name}
                    </h3>
                    <p className="text-sm text-muted mt-1 max-w-sm">{conn.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition-colors mt-1" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text bg-white/5 border border-border rounded-lg hover:bg-white/10 transition-colors">
                  <Plus className="h-3 w-3" /> New Connection
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-text transition-colors">
                  <Settings className="h-3 w-3" /> Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">Active Connections</h2>
        </div>
        <div className="px-6 py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Cable className="h-6 w-6 text-accent" />
            </div>
            <p className="text-muted text-sm">No active connections yet.</p>
            <p className="text-xs text-muted max-w-xs">
              Connect your projects to external databases and services to enable persistent storage and integrations.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 shrink-0">
            <Zap className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text mb-1">Connect to a project</h3>
            <p className="text-sm text-muted">
              Select a project below to configure a database or service connection.
            </p>
          </div>
        </div>
        {projects.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.slice(0, 4).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}/settings`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface/30 p-3 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-surface/80 flex items-center justify-center text-[10px] font-medium text-text">
                    {project.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text">{project.name}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <Link
              href="/dashboard/projects/new"
              className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Create your first project &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
