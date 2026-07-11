import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRightLeft,
  Trash2,
  Info,
  ArrowRight,
  Plus,
} from "lucide-react";
import { addRedirect, deleteRedirect } from "./actions";

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  permanent: { color: "bg-green-500/10 text-green-500", label: "301" },
  redirect: { color: "bg-blue-500/10 text-blue-500", label: "302" },
  rewrite: { color: "bg-purple-500/10 text-purple-500", label: "Rewrite" },
};

export default async function RedirectsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { redirects: true },
  });
  if (!project) notFound();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Redirects</h2>
        <p className="text-muted text-sm">
          Manage URL redirects and rewrites for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Add redirect form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-3">Add Redirect</h3>
        <form
          action={addRedirect.bind(null, project.id)}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end"
        >
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-muted mb-1">Source</label>
            <input
              name="source"
              required
              placeholder="/old-path"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-muted mb-1">Destination</label>
            <input
              name="destination"
              required
              placeholder="/new-path"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Type</label>
            <select
              name="type"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            >
              <option value="permanent">301 Permanent</option>
              <option value="redirect">302 Temporary</option>
              <option value="rewrite">Rewrite</option>
            </select>
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

      {/* Redirect list */}
      {project.redirects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <ArrowRightLeft className="w-7 h-7 text-accent" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium text-text">No redirects yet</h3>
            <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
              Add a source and destination path above to create a URL redirect or rewrite.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {project.redirects.map((r) => {
            const typeConfig = TYPE_CONFIG[r.type] || TYPE_CONFIG.permanent;

            return (
              <div
                key={r.id}
                className="bg-surface border border-border rounded-xl px-5 py-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg ${typeConfig.color}`}
                    >
                      {typeConfig.label}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-sm min-w-0">
                      <span className="text-text truncate">{r.source}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span className="text-accent truncate">{r.destination}</span>
                    </div>
                  </div>
                  <form action={deleteRedirect.bind(null, project.id, r.id)}>
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete redirect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted space-y-1">
          <p>
            <strong className="text-text">301 Permanent</strong> — The old URL is permanently
            moved. Search engines update their index.
          </p>
          <p>
            <strong className="text-text">302 Temporary</strong> — The old URL is temporarily
            redirected. Search engines keep the original indexed.
          </p>
          <p>
            <strong className="text-text">Rewrite</strong> — The URL in the browser bar
            doesn&apos;t change. Content is served from the destination transparently.
          </p>
        </div>
      </div>
    </div>
  );
}
