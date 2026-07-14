import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  GitBranch,
  GitCommitHorizontal,
  KeyRound,
  Link2,
  Copy,
  Webhook,
  CheckCircle2,
  AlertCircle,
  Power,
} from "lucide-react";

export default async function ConnectPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const repoName = project.gitUrl
    ? project.gitUrl.replace("https://github.com/", "").replace(".git", "")
    : null;

  const fakePublicKey =
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHkL7J9xQ2M3vTbGh6aFpL2dR8sW4kN1eY7cX5zA0vQk deploy@grob";

  const deployHooks = [
    {
      id: "hook-1",
      url: `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/deploy/${project.id}`,
      event: "push",
    },
    {
      id: "hook-2",
      url: `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/preview/${project.id}`,
      event: "pull_request",
    },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Connect</h2>
        <p className="text-muted text-sm">
          Manage Git provider, branches, and deploy hooks for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Git Provider */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Git Provider</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          {repoName ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center">
                  <span className="text-lg font-bold text-text">G</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-text">GitHub</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-success border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 font-mono">{repoName}</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-error bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition">
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center">
                  <span className="text-lg font-bold text-muted">?</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-text">No Provider</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted/10 text-muted border border-border">
                      <AlertCircle className="w-3 h-3" />
                      Not Connected
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Connect a Git repository to enable automatic deployments
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
                Connect GitHub
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Deployment Branches */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <GitCommitHorizontal className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Deployment Branches</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-text">main</p>
              <p className="text-xs text-muted">Primary production branch</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Auto-deploy</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-success border border-green-500/20">
                Production
              </span>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Preview Deployments</p>
                <p className="text-xs text-muted">
                  Automatically deploy preview environments for pull requests
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* SSH Key */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">SSH Key</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-muted mb-3">
            Use this public key to configure deploy keys on your Git provider.
          </p>
          <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2.5">
            <code className="text-xs text-text font-mono break-all flex-1 select-all">
              {fakePublicKey}
            </code>
            <button
              className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.05] transition-colors shrink-0"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Deploy Hooks */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Webhook className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Deploy Hooks</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <p className="text-xs text-muted">
            Trigger deployments by sending POST requests to these webhook URLs.
          </p>
          {deployHooks.map((hook) => (
            <div
              key={hook.id}
              className="flex items-center justify-between gap-4 bg-bg border border-border rounded-lg px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs text-text font-mono truncate">
                    {hook.url}
                  </code>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-info shrink-0">
                    {hook.event}
                  </span>
                </div>
              </div>
              <button
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.05] transition-colors shrink-0"
                title="Copy webhook URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
            <Link2 className="w-4 h-4" />
            Generate New Hook
          </button>
        </div>
      </section>
    </div>
  );
}
