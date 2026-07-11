import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Code2,
  Plus,
  Trash2,
  Power,
  PowerOff,
  FileCode,
  Clock,
} from "lucide-react";
import { addFunction, deleteFunction, toggleFunctionStatus } from "./actions";

const RUNTIME_STYLES: Record<string, { color: string; label: string }> = {
  nodejs: { color: "bg-green-500/10 text-green-500", label: "Node.js" },
  python: { color: "bg-blue-500/10 text-blue-500", label: "Python" },
  go: { color: "bg-cyan-500/10 text-cyan-500", label: "Go" },
  ruby: { color: "bg-red-500/10 text-red-500", label: "Ruby" },
};

const METHOD_STYLES: Record<string, { color: string; bg: string }> = {
  ANY: { color: "text-muted", bg: "bg-muted/10" },
  GET: { color: "text-green-500", bg: "bg-green-500/10" },
  POST: { color: "text-blue-500", bg: "bg-blue-500/10" },
  PUT: { color: "text-orange-500", bg: "bg-orange-500/10" },
  PATCH: { color: "text-purple-500", bg: "bg-purple-500/10" },
  DELETE: { color: "text-red-500", bg: "bg-red-500/10" },
};

export default async function FunctionsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { functions: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Functions</h2>
        <p className="text-muted text-sm">
          Manage serverless functions for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Add function form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-3">Add Function</h3>
        <form
          action={addFunction.bind(null, project.id)}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end"
        >
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-muted mb-1">Route</label>
            <input
              name="name"
              required
              placeholder="api/hello"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Method</label>
            <select
              name="method"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            >
              {["ANY", "GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Runtime</label>
            <select
              name="runtime"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            >
              {Object.keys(RUNTIME_STYLES).map((r) => (
                <option key={r} value={r}>{RUNTIME_STYLES[r].label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-muted mb-1">Source Path</label>
            <input
              name="sourcePath"
              placeholder="api/hello.ts"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>
      </div>

      {/* Function list */}
      {project.functions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Code2 className="w-7 h-7 text-accent" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium text-text">No functions yet</h3>
            <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
              Add a serverless function by specifying its route, method, and runtime above.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {project.functions.map((fn) => {
            const runtime = RUNTIME_STYLES[fn.runtime] || { color: "bg-muted/10 text-muted", label: fn.runtime };
            const method = METHOD_STYLES[fn.method] || METHOD_STYLES.ANY;
            const isActive = fn.status === "active";

            return (
              <div
                key={fn.id}
                className="bg-surface border border-border rounded-xl px-5 py-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileCode className="w-4 h-4 text-muted shrink-0" />
                    <span className="font-mono text-sm text-text truncate">
                      {fn.name}
                    </span>
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded ${method.bg} ${method.color}`}
                    >
                      {fn.method}
                    </span>
                    <span
                      className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${runtime.color}`}
                    >
                      {runtime.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted font-mono hidden sm:inline">
                      {fn.sourcePath || fn.name}
                    </span>
                    <form
                      action={toggleFunctionStatus.bind(
                        null,
                        project.id,
                        fn.id,
                        fn.status
                      )}
                    >
                      <button
                        type="submit"
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                          isActive
                            ? "border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "border-border text-muted hover:bg-white/[0.03]"
                        }`}
                        title={isActive ? "Disable function" : "Enable function"}
                      >
                        {isActive ? (
                          <Power className="w-3 h-3" />
                        ) : (
                          <PowerOff className="w-3 h-3" />
                        )}
                        {isActive ? "Active" : "Off"}
                      </button>
                    </form>
                    <form action={deleteFunction.bind(null, project.id, fn.id)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete function"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
        <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted space-y-1">
          <p>
            Functions are automatically deployed when you push to your repository.
          </p>
          <p>
            Each function runs in an isolated serverless environment with up to 10s execution time on
            the free tier.
          </p>
        </div>
      </div>
    </div>
  );
}
