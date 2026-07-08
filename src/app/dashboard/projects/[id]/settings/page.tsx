import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { saveEnvVars, saveProjectConfig, createWebhook, toggleWebhook, deleteWebhook, saveProtection } from "./actions";

export default async function ProjectSettingsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      envVars: { orderBy: { key: "asc" } },
      webhooks: true,
      protection: true,
    },
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
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-muted text-sm mb-8">Manage project configuration.</p>

      <div className="max-w-2xl space-y-10">
        <section>
          <h2 className="text-lg font-semibold mb-4">Build Configuration</h2>
          <form action={saveProjectConfig.bind(null, project.id)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Git URL</label>
              <input
                name="gitUrl"
                defaultValue={project.gitUrl}
                placeholder="https://github.com/username/repo"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Build Command</label>
                <input
                  name="buildCommand"
                  defaultValue={project.buildCommand}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Output Directory</label>
                <input
                  name="outputDir"
                  defaultValue={project.outputDir}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Install Command</label>
              <input
                name="installCommand"
                defaultValue={project.installCommand}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Framework</label>
              <input
                name="framework"
                defaultValue={project.framework}
                placeholder="nextjs, react, vue, etc."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
              >
                Save Configuration
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
          <p className="text-sm text-muted mb-4">
            These are injected at build time.
          </p>
          <form action={saveEnvVars.bind(null, project.id)} className="space-y-3">
            <div id="envVars">
              {project.envVars.length === 0 ? (
                <div className="p-4 border-2 border-dashed rounded-xl text-center text-sm text-muted" id="emptyState">
                  No environment variables yet
                </div>
              ) : null}
              {project.envVars.map((env, i) => (
                <div key={env.id} className="flex gap-2 mb-2 env-row">
                  <input
                    name="key[]"
                    defaultValue={env.key}
                    placeholder="KEY"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
                  />
                  <input
                    name="value[]"
                    defaultValue={env.value}
                    placeholder="value"
                    className="flex-[2] px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const row = (e.target as HTMLElement).closest(".env-row");
                      row?.remove();
                    }}
                    className="px-3 py-2 text-sm border rounded-lg hover:bg-white/[0.05]"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById("envVars");
                  const empty = document.getElementById("emptyState");
                  if (empty) empty.remove();
                  const row = document.createElement("div");
                  row.className = "flex gap-2 mb-2 env-row";
                  row.innerHTML = `
                    <input name="key[]" placeholder="KEY" class="flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent" />
                    <input name="value[]" placeholder="value" class="flex-[2] px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent" />
                    <button type="button" onclick="this.closest('.env-row').remove()" class="px-3 py-2 text-sm border rounded-lg hover:bg-white/[0.05]">&times;</button>
                  `;
                  container?.appendChild(row);
                }}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-white/[0.05]"
              >
                + Add Variable
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
              >
                Save Variables
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Webhooks</h2>
          <p className="text-sm text-muted mb-4">
            Trigger auto-deploys by sending POST requests to your webhook URL.
            Configure your Git provider to send push events to the URL below.
          </p>

          <div className="p-4 mb-4 bg-surface rounded-xl">
            <p className="text-xs text-muted mb-1">Webhook URL</p>
            <p className="font-mono text-sm break-all">
              {`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/webhooks/${project.id}`}
            </p>
          </div>

          <div className="flex mb-6">
            <form action={createWebhook.bind(null, project.id)}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
              >
                Generate Webhook
              </button>
            </form>
          </div>

          {project.webhooks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-xl">
              <p className="text-muted text-sm">No webhooks configured.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.webhooks.map((wh) => (
                <div key={wh.id} className="p-4 border rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono break-all">{wh.url}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        <span>Events: {wh.events}</span>
                        {wh.githubRepo && <span className="text-blue-500">{wh.githubRepo}</span>}
                        <span>Secret: <code className="font-mono">{wh.secret || "none"}</code></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={toggleWebhook.bind(null, project.id, wh.id)}>
                        <button
                          type="submit"
                          className={`text-xs px-3 py-1.5 border rounded-lg ${
                            wh.active
                              ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                              : "text-muted"
                          }`}
                        >
                          {wh.active ? "Active" : "Inactive"}
                        </button>
                      </form>
                      <form action={deleteWebhook.bind(null, project.id, wh.id)}>
                        <button
                          type="submit"
                          className="text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Deployment Protection</h2>
          <p className="text-sm text-muted mb-4">
            Protect production deployments with password or branch restrictions.
          </p>
          <form action={saveProtection.bind(null, project.id)} className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={project.protection?.enabled}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Enable deployment protection</span>
            </label>
            <input
              name="password"
              type="text"
              defaultValue={project.protection?.password || ""}
              placeholder="Deployment password (optional)"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
              >
                Save Protection
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
