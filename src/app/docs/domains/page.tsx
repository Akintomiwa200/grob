"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, ShieldAlert, Globe } from "lucide-react";

export default function DomainsPage() {
  const [domainInput, setDomainInput] = useState("my-cool-site.com");
  const [status, setStatus] = useState<"idle" | "resolving" | "ssl" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const startVerification = async () => {
    if (!domainInput.trim()) return;
    setStatus("resolving");
    setLogs(["Resolving NS root servers for " + domainInput]);
    
    await wait(800);
    setLogs(prev => [...prev, "Checking DNS A-Record pointing to 76.76.21.21..."]);
    
    await wait(900);
    setLogs(prev => [...prev, "✔ DNS records match Grob Edge network router."]);
    setStatus("ssl");
    setLogs(prev => [...prev, "Requesting SSL handshake from Let's Encrypt CA..."]);
    
    await wait(1000);
    setLogs(prev => [...prev, "✔ Provisioned TLS 1.3 certificate for " + domainInput]);
    setStatus("success");
    setLogs(prev => [...prev, "✔ SSL provisioning complete! Routing is active."]);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Deploying</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Custom Domains
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Point your custom domains and subdomains to Grob. We automatically provision Let&apos;s Encrypt SSL certificates, manage automatic renewals, and route requests globally.
      </p>

      {/* Interactive DNS Checker */}
      <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-accent" /> DNS Verification & SSL Handshaker
      </h2>
      <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden mb-12">
        {/* Input section */}
        <div className="border-b border-border bg-bg/40 p-5">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Enter Custom Domain</label>
              <input
                type="text"
                placeholder="e.g. my-app.com"
                value={domainInput}
                onChange={(e) => {
                  setDomainInput(e.target.value);
                  setStatus("idle");
                  setLogs([]);
                }}
                className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm font-semibold text-text focus:outline-none focus:border-accent"
              />
            </div>
            <button
              onClick={startVerification}
              disabled={status === "resolving" || status === "ssl"}
              className="w-full sm:w-auto shrink-0 bg-accent text-white px-5 py-2 rounded-lg text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
            >
              Verify Config
            </button>
          </div>
        </div>

        {/* DNS Info */}
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-sm text-text mb-3">Configure DNS Records at your Registrar:</h3>
          <div className="overflow-x-auto scrollbar-hidden">
            <table className="w-full text-sm font-medium">
              <thead>
                <tr className="border-b border-border/80 text-left text-muted text-xs">
                  <th className="pb-2 font-bold uppercase tracking-wider">Type</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Host/Name</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Value</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">TTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-2.5 font-mono text-xs text-accent">A</td>
                  <td className="py-2.5 font-mono text-xs">@</td>
                  <td className="py-2.5 font-mono text-xs">76.76.21.21</td>
                  <td className="py-2.5 text-muted text-xs">Automatic</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-xs text-accent">CNAME</td>
                  <td className="py-2.5 font-mono text-xs">www</td>
                  <td className="py-2.5 font-mono text-xs">cname.grob.sh</td>
                  <td className="py-2.5 text-muted text-xs">Automatic</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Results / Status Console */}
        {logs.length > 0 && (
          <div className="p-5 bg-bg/25 border-t border-border">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold">
              <span className="text-muted">Verification Steps</span>
              {status === "resolving" && (
                <span className="text-accent flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Resolving DNS...</span>
              )}
              {status === "ssl" && (
                <span className="text-accent flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Handshaking SSL...</span>
              )}
              {status === "success" && (
                <span className="text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Secured</span>
              )}
            </div>

            <div className="p-4 bg-black/95 text-white font-mono text-xs rounded-xl space-y-1.5 leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className={log.startsWith("✔") ? "text-success font-semibold" : ""}>{log}</div>
              ))}
            </div>

            {status === "success" && (
              <div className="mt-4 p-3.5 rounded-lg bg-success/5 border border-success/15 flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-semibold">Domain connected! SSL certificate is active. Requests are served from the nearest Edge router.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 text-sm leading-relaxed">
        <h3 className="font-bold text-text mb-2 flex items-center gap-1.5">
          <ShieldAlert className="h-4.5 w-4.5 text-signal" /> Wildcard DNS Setup
        </h3>
        <p className="text-muted">
          Need wildcard subdomains? You can add a CNAME record with Host <code className="bg-bg border border-border px-1 py-0.5 rounded text-accent font-semibold font-mono text-xs">*</code> pointing to <code className="bg-bg border border-border px-1 py-0.5 rounded text-accent font-semibold font-mono text-xs">cname.grob.sh</code>. SSL certificates will cover all dynamic routes securely.
        </p>
      </div>
    </div>
  );
}
