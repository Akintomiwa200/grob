import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Bell,
  MessageSquare,
  Globe,
  Power,
  PowerOff,
  Trash2,
  Send,
  Info,
  Hash,
} from "lucide-react";
import { addNotification, deleteNotification, toggleNotification } from "./actions";

const CHANNEL_CONFIG: Record<string, { icon: typeof MessageSquare; color: string; label: string; placeholder: string }> = {
  slack: { icon: MessageSquare, color: "bg-purple-500/10 text-purple-500", label: "Slack", placeholder: "https://hooks.slack.com/services/..." },
  discord: { icon: Hash, color: "bg-indigo-500/10 text-indigo-500", label: "Discord", placeholder: "https://discord.com/api/webhooks/..." },
  webhook: { icon: Globe, color: "bg-blue-500/10 text-blue-500", label: "Webhook", placeholder: "https://your-server.com/webhook" },
};

const EVENT_LABELS: Record<string, string> = {
  "deploy.success": "Deploy Success",
  "deploy.failed": "Deploy Failed",
};

export default async function NotificationsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { notifications: true },
  });
  if (!project) notFound();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Notifications</h2>
        <p className="text-muted text-sm">
          Get deployment status updates in Slack, Discord, or any webhook for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Add channel form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-3">Add Notification Channel</h3>
        <form
          action={addNotification.bind(null, project.id)}
          className="space-y-3"
        >
          <div className="flex gap-3">
            <select
              name="type"
              className="px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            >
              <option value="slack">Slack</option>
              <option value="discord">Discord</option>
              <option value="webhook">Generic Webhook</option>
            </select>
            <input
              name="url"
              required
              placeholder="https://hooks.slack.com/..."
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm text-text placeholder-muted bg-bg font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition shrink-0"
            >
              <Send className="w-4 h-4" />
              Add
            </button>
          </div>
          <p className="text-xs text-muted">
            Select a channel type and paste the webhook URL from your Slack, Discord, or custom endpoint.
          </p>
        </form>
      </div>

      {/* Channel list */}
      {project.notifications.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Bell className="w-7 h-7 text-accent" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium text-text">No notification channels</h3>
            <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
              Add a webhook URL above to receive deployment notifications in your
              team&apos;s chat.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {project.notifications.map((n) => {
            const config = CHANNEL_CONFIG[n.type] || CHANNEL_CONFIG.webhook;
            const ChannelIcon = config.icon;
            const isActive = n.active;
            let events: string[] = [];
            try {
              events = JSON.parse(n.events);
            } catch {}

            return (
              <div
                key={n.id}
                className="bg-surface border border-border rounded-xl px-5 py-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}
                    >
                      <ChannelIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text">
                          {config.label}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${
                            isActive
                              ? "bg-green-500/10 text-green-500"
                              : "bg-muted/10 text-muted"
                          }`}
                        >
                          {isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted truncate mt-0.5 max-w-md">
                        {n.url}
                      </p>
                      {events.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {events.map((ev) => (
                            <span
                              key={ev}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-bg border border-border text-muted"
                            >
                              {EVENT_LABELS[ev] || ev}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <form action={toggleNotification.bind(null, project.id, n.id)}>
                      <button
                        type="submit"
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                          isActive
                            ? "border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "border-border text-muted hover:bg-white/[0.03]"
                        }`}
                        title={isActive ? "Pause notifications" : "Resume notifications"}
                      >
                        {isActive ? (
                          <Power className="w-3 h-3" />
                        ) : (
                          <PowerOff className="w-3 h-3" />
                        )}
                        {isActive ? "Active" : "Paused"}
                      </button>
                    </form>
                    <form action={deleteNotification.bind(null, project.id, n.id)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete channel"
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
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted space-y-1">
          <p>
            Notifications are sent for <strong className="text-text">deploy succeeded</strong> and{" "}
            <strong className="text-text">deploy failed</strong> events by default.
          </p>
          <p>
            For Slack, create an{" "}
            <span className="text-text">Incoming Webhook</span>{" "}
            in your workspace settings. For Discord, use the{" "}
            <span className="text-text">Integrations → Webhooks</span>{" "}
            section in your server settings.
          </p>
        </div>
      </div>
    </div>
  );
}
