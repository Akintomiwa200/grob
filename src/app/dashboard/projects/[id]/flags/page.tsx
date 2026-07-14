import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Flag, Plus, Calendar } from "lucide-react";

const FEATURE_FLAGS = [
  {
    id: "dark_mode",
    name: "Dark Mode",
    key: "dark_mode",
    enabled: true,
    rollout: 100,
    created: "2025-03-15",
  },
  {
    id: "beta_features",
    name: "Beta Features",
    key: "beta_features",
    enabled: true,
    rollout: 25,
    created: "2025-06-01",
  },
  {
    id: "new_checkout",
    name: "New Checkout Flow",
    key: "new_checkout",
    enabled: false,
    rollout: 0,
    created: "2025-09-22",
  },
  {
    id: "ai_suggestions",
    name: "AI Suggestions",
    key: "ai_suggestions",
    enabled: true,
    rollout: 50,
    created: "2025-11-10",
  },
];

export default async function FlagsPage(props: {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">Feature Flags</h2>
          <p className="text-muted text-sm">
            Manage feature flags for{" "}
            <span className="text-text font-medium">{project.name}</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" />
          Create Flag
        </button>
      </div>

      {FEATURE_FLAGS.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Flag className="w-7 h-7 text-accent" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium text-text">No feature flags</h3>
            <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
              Create your first feature flag to enable gradual rollouts and
              experiments.
            </p>
          </div>
        </div>
      ) : (
        <section>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_80px_120px_60px] gap-4 px-5 py-3 border-b border-border text-xs font-medium text-muted uppercase tracking-wider">
              <span>Name</span>
              <span>Key</span>
              <span>Status</span>
              <span>Rollout</span>
              <span className="text-right">Enabled</span>
            </div>
            {FEATURE_FLAGS.map((flag) => (
              <div
                key={flag.id}
                className="grid grid-cols-[1fr_1fr_80px_120px_60px] gap-4 items-center px-5 py-4 border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-text">{flag.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-muted" />
                    <span className="text-[10px] text-muted">{flag.created}</span>
                  </div>
                </div>
                <code className="text-xs font-mono text-muted">{flag.key}</code>
                <span
                  className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    flag.enabled
                      ? "bg-green-500/10 text-success border border-green-500/20"
                      : "bg-muted/10 text-muted border border-border"
                  }`}
                >
                  {flag.enabled ? "Active" : "Inactive"}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text font-medium">
                      {flag.rollout}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${flag.rollout}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={flag.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
