import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Settings,
  GitBranch,
  Variable,
  Webhook,
  Shield,
  Power,
  PowerOff,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import {
  saveEnvVars,
  saveProjectConfig,
  createWebhook,
  toggleWebhook,
  deleteWebhook,
  saveProtection,
} from "./actions";
import { EnvVarsForm } from "./EnvVarsForm";
import { CopyButton } from "./CopyButton";

export default async function ProjectSettingsPage(props: {
  params: Promise<{ id: string }>;
}) {
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

  const webhookUrl = `${
    process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "http://localhost:3000"
  }/api/webhooks/${project.id}`;

  return (
    <div className="max-w-6xl space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Settings</h2>
        <p className="text-muted text-sm">
          Manage configuration for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      <div className="space-y-10">
        {/* Build Configuration */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-muted" />
            <h3 className="text-base font-semibold text-text">Build Configuration</h3>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <form
              action={saveProjectConfig.bind(null, project.id)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Project Name
                  </label>
                  <input
                    name="name"
                    defaultValue={project.name}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Framework
                  </label>
                  <input
                    name="framework"
                    defaultValue={project.framework}
                    placeholder="nextjs, react, vue, etc."
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Git Repository URL
                  </label>
                  <div className="relative">
                    <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      name="gitUrl"
                      defaultValue={project.gitUrl}
                      placeholder="https://github.com/username/repo"
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">
                  Description
                </label>
                <input
                  name="description"
                  defaultValue={project.description}
                  placeholder="A brief description of your project"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Build Command
                  </label>
                  <input
                    name="buildCommand"
                    defaultValue={project.buildCommand}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Output Directory
                  </label>
                  <input
                    name="outputDir"
                    defaultValue={project.outputDir}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Install Command
                  </label>
                  <input
                    name="installCommand"
                    defaultValue={project.installCommand}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Environment Variables */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Variable className="w-4 h-4 text-muted" />
            <h3 className="text-base font-semibold text-text">
              Environment Variables
            </h3>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs text-muted mb-4">
              Injected at build time and runtime. Toggle the build flag to control
              availability during the build step.
            </p>
            <EnvVarsForm
              projectId={project.id}
              initialVars={project.envVars}
              saveAction={saveEnvVars.bind(null, project.id)}
            />
          </div>
        </section>

        {/* Webhooks */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Webhook className="w-4 h-4 text-muted" />
            <h3 className="text-base font-semibold text-text">Webhooks</h3>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs text-muted mb-2">
                Trigger auto-deploys by sending POST requests to your webhook URL.
              </p>
              <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2.5">
                <code className="text-xs text-text font-mono break-all flex-1">
                  {webhookUrl}
                </code>
                <CopyButton text={webhookUrl} />
              </div>
            </div>

            <form action={createWebhook.bind(null, project.id)}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition"
              >
                Generate Webhook
              </button>
            </form>
          </div>

          {/* Webhook list */}
          {project.webhooks.length > 0 && (
            <div className="mt-4 space-y-2">
              {project.webhooks.map((wh) => {
                const isActive = wh.active;
                return (
                  <div
                    key={wh.id}
                    className="bg-surface border border-border rounded-xl px-5 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs text-text truncate">
                            {wh.url}
                          </code>
                          {wh.githubRepo && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 shrink-0">
                              {wh.githubRepo}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                          <span>
                            Secret:{" "}
                            <code className="font-mono">
                              {wh.secret
                                ? wh.secret.slice(0, 8) + "\u2022\u2022\u2022\u2022"
                                : "none"}
                            </code>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <form
                          action={toggleWebhook.bind(null, project.id, wh.id)}
                        >
                          <button
                            type="submit"
                            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                              isActive
                                ? "border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                : "border-border text-muted hover:bg-white/[0.03]"
                            }`}
                          >
                            {isActive ? (
                              <Power className="w-3 h-3" />
                            ) : (
                              <PowerOff className="w-3 h-3" />
                            )}
                            {isActive ? "Active" : "Inactive"}
                          </button>
                        </form>
                        <form
                          action={deleteWebhook.bind(null, project.id, wh.id)}
                        >
                          <button
                            type="submit"
                            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete webhook"
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
        </section>

        {/* Deployment Protection */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-muted" />
            <h3 className="text-base font-semibold text-text">
              Deployment Protection
            </h3>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs text-muted mb-4">
              Protect preview deployments with a shared password. Production
              deployments are always accessible.
            </p>
            <form
              action={saveProtection.bind(null, project.id)}
              className="space-y-4"
            >
              <div className="flex items-center justify-between bg-bg border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  {project.protection?.enabled ? (
                    <Lock className="w-4 h-4 text-green-500" />
                  ) : (
                    <Unlock className="w-4 h-4 text-muted" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-text">
                      {project.protection?.enabled
                        ? "Protection enabled"
                        : "Protection disabled"}
                    </span>
                    <p className="text-xs text-muted mt-0.5">
                      {project.protection?.enabled
                        ? "Preview deployments require a password"
                        : "Preview deployments are publicly accessible"}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={project.protection?.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              <div className="max-w-md">
                <label className="block text-xs text-muted mb-1.5">
                  Password
                </label>
                <input
                  name="password"
                  type="text"
                  defaultValue={project.protection?.password || ""}
                  placeholder="Enter a password for preview deployments"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition"
              >
                Save Protection
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
