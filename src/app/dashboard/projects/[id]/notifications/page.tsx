import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { addNotification, deleteNotification, toggleNotification } from "./actions";

export default async function NotificationsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { notifications: true },
  });
  if (!project) notFound();

  return (
    <div>
      <Link
        href={`/dashboard/projects/${id}`}
        className="text-sm text-muted hover:text-text mb-1 block"
      >
        &larr; {project.name}
      </Link>
      <h1 className="text-2xl font-bold mb-1">Notifications</h1>
      <p className="text-muted text-sm mb-8">
        Get deployment status updates in Slack, Discord, or any webhook.
      </p>

      <div className="max-w-2xl space-y-6">
        <form action={addNotification.bind(null, project.id)} className="space-y-3 p-4 border rounded-xl">
          <h3 className="font-medium text-sm">Add Notification Channel</h3>
          <div className="flex gap-3">
            <select
              name="type"
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            >
              <option value="slack">Slack</option>
              <option value="discord">Discord</option>
              <option value="webhook">Generic Webhook</option>
            </select>
            <input
              name="url"
              placeholder="https://hooks.slack.com/..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
            >
              Add
            </button>
          </div>
        </form>

        {project.notifications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted text-sm">No notification channels configured.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.notifications.map((n) => (
              <div key={n.id} className="p-4 border rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-medium text-muted">{n.type}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${n.active ? "bg-success/10 text-success" : "bg-white/[0.05] text-muted"}`}>
                      {n.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted mt-1 truncate max-w-md">{n.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleNotification.bind(null, project.id, n.id)}>
                    <button type="submit" className="text-xs px-3 py-1.5 border rounded-lg hover:bg-white/[0.05]">
                      {n.active ? "Pause" : "Activate"}
                    </button>
                  </form>
                  <form action={deleteNotification.bind(null, project.id, n.id)}>
                    <button type="submit" className="text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
