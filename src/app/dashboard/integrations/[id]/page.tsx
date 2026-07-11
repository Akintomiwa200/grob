import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Blocks, ArrowLeft, CheckCircle2, ExternalLink, Settings, Trash2, Webhook, Bell, Key, Clock } from "lucide-react";
import Link from "next/link";

const integrationData: Record<string, { name: string; desc: string; category: string; connected: boolean; fields: { label: string; type: string; placeholder: string }[] }> = {
  github: { name: "GitHub", desc: "Automatic deployments from GitHub repositories.", category: "Version Control", connected: true, fields: [{ label: "Repository URL", type: "text", placeholder: "https://github.com/user/repo" }, { label: "Branch", type: "text", placeholder: "main" }, { label: "Webhook Secret", type: "password", placeholder: "••••••••" }] },
  slack: { name: "Slack", desc: "Deployment notifications in Slack channels.", category: "Notifications", connected: false, fields: [{ label: "Webhook URL", type: "text", placeholder: "https://hooks.slack.com/..." }, { label: "Channel", type: "text", placeholder: "#deployments" }] },
  discord: { name: "Discord", desc: "Send deployment updates to Discord.", category: "Notifications", connected: false, fields: [{ label: "Webhook URL", type: "text", placeholder: "https://discord.com/api/webhooks/..." }] },
  sentry: { name: "Sentry", desc: "Track and monitor errors.", category: "Monitoring", connected: false, fields: [{ label: "DSN", type: "text", placeholder: "https://key@sentry.io/project" }, { label: "Org Slug", type: "text", placeholder: "my-org" }] },
  datadog: { name: "Datadog", desc: "Export metrics and logs.", category: "Monitoring", connected: false, fields: [{ label: "API Key", type: "password", placeholder: "••••••••" }, { label: "Site", type: "text", placeholder: "datadoghq.com" }] },
};

export default async function IntegrationDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;
  const data = integrationData[id] || { name: id, desc: "Integration configuration", category: "General", connected: false, fields: [] };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/integrations" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Integrations
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text">{data.name}</h1>
              {data.connected && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Connected</span>}
            </div>
            <p className="text-muted text-sm mt-1">{data.desc}</p>
          </div>
          {data.connected ? (
            <button className="px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5"><Trash2 className="h-4 w-4" /> Disconnect</button>
          ) : (
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Connect</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Setup Instructions</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent shrink-0">1</span>
              <p className="text-sm text-text">Install the {data.name} app or create a webhook in your {data.name} settings.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent shrink-0">2</span>
              <p className="text-sm text-text">Copy the credentials from {data.name} and paste them below.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent shrink-0">3</span>
              <p className="text-sm text-text">Click Connect to activate the integration.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Configuration</h2>
          <div className="space-y-4">
            {data.fields.map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-text mb-1">{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Events</label>
              <div className="space-y-2">
                {["deploy.success", "deploy.failed", "deploy.started"].map((evt) => (
                  <label key={evt} className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" defaultChecked className="accent-accent" /> {evt}
                  </label>
                ))}
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">{data.connected ? "Update" : "Save & Connect"}</button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30"><h2 className="font-semibold text-text">Activity Log</h2></div>
        <div className="px-6 py-12 text-center">
          <Clock className="h-6 w-6 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No activity yet.</p>
        </div>
      </div>
    </div>
  );
}
