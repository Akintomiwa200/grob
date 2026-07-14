import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Plug, CheckCircle2, PlusCircle } from "lucide-react";

const INTEGRATIONS = [
  {
    id: "slack",
    name: "Slack",
    description: "Get deployment notifications and alerts in Slack channels",
    letter: "S",
    color: "bg-purple-500",
    connected: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Sync repositories and manage deployments from GitHub",
    letter: "G",
    color: "bg-zinc-700",
    connected: true,
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "Connect GitLab repositories for CI/CD pipelines",
    letter: "L",
    color: "bg-orange-500",
    connected: false,
  },
  {
    id: "discord",
    name: "Discord",
    description: "Receive real-time deployment updates in Discord servers",
    letter: "D",
    color: "bg-indigo-500",
    connected: false,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Collaborate on deployments with Teams notifications",
    letter: "T",
    color: "bg-blue-600",
    connected: false,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Link deployments to Jira issues for traceability",
    letter: "J",
    color: "bg-blue-500",
    connected: false,
  },
];

export default async function IntegrationsPage(props: {
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
        <h2 className="text-xl font-semibold text-text mb-1">Integrations</h2>
        <p className="text-muted text-sm">
          Connect third-party services to{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Plug className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">
            Available Integrations
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.id}
              className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {integration.letter}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text">
                      {integration.name}
                    </h4>
                    {integration.connected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">
                {integration.description}
              </p>
              {integration.connected ? (
                <button className="w-full px-4 py-2 text-sm font-medium text-error bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition">
                  Disconnect
                </button>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition">
                  <PlusCircle className="w-4 h-4" />
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
