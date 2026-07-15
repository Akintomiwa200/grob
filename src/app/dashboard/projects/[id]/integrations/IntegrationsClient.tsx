"use client";

import { useState } from "react";
import { Plug, CheckCircle2, PlusCircle, Loader2, Copy, X } from "lucide-react";
import { connectIntegration, disconnectIntegration } from "./actions";

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  connectedAt: string | null;
  config: string;
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm6.313 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.531 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 11.358 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 6.313a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 13.856 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.531 2.523h-6.312z" fill="#E01E5A" />
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
      <path d="M15.147 7.563a2.528 2.528 0 0 1 2.523-2.521A2.528 2.528 0 0 1 20.193 7.56v2.521h-2.523zm0 1.268a2.528 2.528 0 0 1 2.523 2.521 2.527 2.527 0 0 1-2.523 2.521h-6.312A2.527 2.527 0 0 1 6.312 11.352a2.528 2.528 0 0 1 2.523-2.521h6.312z" fill="#2EB67D" />
      <path d="M20.193 18.958a2.528 2.528 0 0 1-2.523 2.522 2.527 2.527 0 0 1-2.52-2.522v-2.521h2.52zm0-1.268a2.527 2.527 0 0 1-2.523-2.521 2.526 2.526 0 0 1 2.523-2.521h6.312A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.531 2.523h-6.312z" fill="#ECB22E" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#E7E9EE">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587c-.121.375.011.79.331 1.022l11.625 8.39a.456.456 0 0 0 5.2 0l11.625-8.39c.321-.231.451-.646.33-1.021z" fill="#FC6D26" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}

function TeamsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M19.604 5.018A4.486 4.486 0 0 0 15.6 2.5a4.486 4.486 0 0 0-4.386 2.118A4.486 4.486 0 0 0 7.2 2.5a4.486 4.486 0 0 0-4.004 2.518A4.486 4.486 0 0 0 1.5 8.9v6.6a4.486 4.486 0 0 0 4.496 4.5h12.008A4.486 4.486 0 0 0 22.5 15.5V8.9a4.486 4.486 0 0 0-2.896-3.882z" fill="#5059C9" />
      <path d="M14.5 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" fill="#5059C9" />
      <path d="M6.5 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" fill="#5059C9" />
      <path d="M18.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" fill="#5059C9" />
      <path d="M5.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" fill="#5059C9" />
      <path d="M12 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" fill="#5059C9" />
    </svg>
  );
}

function JiraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M11.4 0H1.8A1.78 1.78 0 0 0 0 1.77v9.66a1.78 1.78 0 0 0 1.77 1.78h3.73v4.26l4.61-4.26h5.09A1.78 1.78 0 0 0 17 11.43V9.76l3.53 4.55a3.87 3.87 0 0 0 2.36.81 3.94 3.94 0 0 0 3.47-2.03 3.93 3.93 0 0 0-.37-4.8L19.33 4.3a3.94 3.94 0 0 0-6.64 1.12v4.52a1.78 1.78 0 0 0-.73 1.44v7.41a1.78 1.78 0 0 0 1.77 1.77h.01l-4.6 4.24h4.25L22.2 22.2a1.78 1.78 0 0 0 1.77-1.77V16.2a1.78 1.78 0 0 0-1.16-1.66l-3.53-4.55" fill="#0052CC" />
    </svg>
  );
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  slack: SlackIcon,
  github: GitHubIcon,
  gitlab: GitLabIcon,
  discord: DiscordIcon,
  teams: TeamsIcon,
  jira: JiraIcon,
};

const CONFIG_FIELDS: Record<string, { label: string; placeholder: string; key: string }[]> = {
  slack: [
    { label: "Webhook URL", placeholder: "https://hooks.slack.com/services/...", key: "webhookUrl" },
    { label: "Channel", placeholder: "#deployments", key: "channel" },
  ],
  github: [
    { label: "Personal Access Token", placeholder: "ghp_xxxxxxxxxxxx", key: "token" },
  ],
  gitlab: [
    { label: "Access Token", placeholder: "glpat-xxxxxxxxxxxx", key: "token" },
    { label: "Project ID", placeholder: "12345", key: "projectId" },
  ],
  discord: [
    { label: "Webhook URL", placeholder: "https://discord.com/api/webhooks/...", key: "webhookUrl" },
  ],
  teams: [
    { label: "Webhook URL", placeholder: "https://outlook.office.com/webhook/...", key: "webhookUrl" },
  ],
  jira: [
    { label: "API Token", placeholder: "ATATT3xFfGF0...", key: "token" },
    { label: "Email", placeholder: "you@company.com", key: "email" },
    { label: "Domain", placeholder: "yourcompany.atlassian.net", key: "domain" },
  ],
};

export function IntegrationsClient({
  projectId,
  projectName,
  initialIntegrations,
}: {
  projectId: string;
  projectName: string;
  initialIntegrations: Integration[];
}) {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [loading, setLoading] = useState<string | null>(null);
  const [configModal, setConfigModal] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  async function handleConnect(serviceId: string) {
    const fields = CONFIG_FIELDS[serviceId];
    if (fields && fields.length > 0) {
      setConfigModal(serviceId);
      setConfigValues({});
      return;
    }

    setLoading(serviceId);
    await connectIntegration(projectId, serviceId);
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === serviceId
          ? { ...i, connected: true, connectedAt: new Date().toISOString() }
          : i
      )
    );
    setLoading(null);
  }

  async function handleConnectWithConfig() {
    if (!configModal) return;
    setLoading(configModal);
    await connectIntegration(projectId, configModal, configValues);
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === configModal
          ? { ...i, connected: true, connectedAt: new Date().toISOString(), config: JSON.stringify(configValues) }
          : i
      )
    );
    setLoading(null);
    setConfigModal(null);
    setConfigValues({});
  }

  async function handleDisconnect(serviceId: string) {
    setLoading(serviceId);
    await disconnectIntegration(projectId, serviceId);
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === serviceId
          ? { ...i, connected: false, connectedAt: null, config: "{}" }
          : i
      )
    );
    setLoading(null);
  }

  function copyWebhook(serviceId: string) {
    const url = `${window.location.origin}/api/webhooks/${projectId}/${serviceId}`;
    navigator.clipboard.writeText(url);
    setCopied(serviceId);
    setTimeout(() => setCopied(null), 2000);
  }

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Integrations</h2>
        <p className="text-muted text-sm">
          Connect third-party services to{" "}
          <span className="text-text font-medium">{projectName}</span>
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plug className="w-4 h-4 text-muted" />
            <h3 className="text-base font-semibold text-text">
              Available Integrations
            </h3>
          </div>
          <span className="text-xs text-muted">
            {connectedCount} connected
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                    {(() => {
                      const Icon = SERVICE_ICONS[integration.id];
                      return Icon ? <Icon className="w-7 h-7" /> : null;
                    })()}
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
                {integration.connected && (
                  <button
                    onClick={() => copyWebhook(integration.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.06] transition"
                    title="Copy webhook URL"
                  >
                    {copied === integration.id ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">
                {integration.description}
              </p>
              {integration.connected && integration.connectedAt && (
                <p className="text-[10px] text-muted mb-3">
                  Connected {new Date(integration.connectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
              {integration.connected ? (
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  disabled={loading === integration.id}
                  className="w-full px-4 py-2 text-sm font-medium text-error bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50"
                >
                  {loading === integration.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Disconnect"
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(integration.id)}
                  disabled={loading === integration.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading === integration.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Config Modal */}
      {configModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-text">
                  Connect {integrations.find((i) => i.id === configModal)?.name}
                </h3>
                <p className="text-xs text-muted mt-0.5">Enter your credentials below</p>
              </div>
              <button
                onClick={() => { setConfigModal(null); setConfigValues({}); }}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.06] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {(CONFIG_FIELDS[configModal] || []).map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-muted mb-1.5">{field.label}</label>
                  <input
                    type={field.key.includes("token") || field.key.includes("secret") ? "password" : "text"}
                    value={configValues[field.key] || ""}
                    onChange={(e) => setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
              <button
                onClick={() => { setConfigModal(null); setConfigValues({}); }}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectWithConfig}
                disabled={loading === configModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading === configModal ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plug className="w-4 h-4" />
                )}
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
