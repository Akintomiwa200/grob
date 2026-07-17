"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Trash2, Shield, Info } from "lucide-react";

interface EnvVar {
  key: string;
  value: string;
  environments: string[];
  hidden: boolean;
}

export default function EnvVarsPage() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: "DATABASE_URL", value: "postgresql://user:password@host:5432/dbname", environments: ["Production"], hidden: true },
    { key: "STRIPE_SECRET_KEY", value: "sk_live_xxxxxxxxxxxxxxxxxxxx", environments: ["Production", "Preview"], hidden: true },
    { key: "NEXT_PUBLIC_API_URL", value: "https://api.grob-app.dev", environments: ["Production", "Preview", "Development"], hidden: false }
  ]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [selectedEnvs, setSelectedEnvs] = useState<string[]>(["Production"]);

  const toggleHide = (index: number) => {
    setEnvVars(prev => prev.map((item, i) => i === index ? { ...item, hidden: !item.hidden } : item));
  };

  const deleteVar = (index: number) => {
    setEnvVars(prev => prev.filter((_, i) => i !== index));
  };

  const addVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    
    setEnvVars(prev => [...prev, {
      key: newKey.toUpperCase().trim(),
      value: newValue.trim(),
      environments: [...selectedEnvs],
      hidden: true
    }]);

    setNewKey("");
    setNewValue("");
  };

  const handleEnvToggle = (env: string) => {
    setSelectedEnvs(prev => 
      prev.includes(env) 
        ? prev.filter(e => e !== env) 
        : [...prev, env]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Deploying</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Environment Variables
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Secure your applications by configuring environment secrets. Variables are encrypted at rest and automatically injected during the project build stage and routing runtime.
      </p>

      {/* Interactive Env Manager */}
      <h2 className="text-lg font-bold text-text mb-4">Environment Variables Manager</h2>
      <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden mb-12">
        {/* Input Form */}
        <form onSubmit={addVar} className="border-b border-border bg-bg/40 p-5">
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Variable Key</label>
              <input
                type="text"
                placeholder="e.g. DATABASE_URL"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-mono text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Variable Value</label>
              <input
                type="text"
                placeholder="Enter secret value..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-mono text-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1">Scope:</span>
              {["Production", "Preview", "Development"].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => handleEnvToggle(env)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedEnvs.includes(env)
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-surface border-border text-muted hover:text-text"
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!newKey.trim() || !newValue.trim() || selectedEnvs.length === 0}
              className="flex items-center gap-1 rounded-lg bg-accent text-white px-4 py-2 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
            >
              <Plus className="h-4 w-4" /> Add Variable
            </button>
          </div>
        </form>

        {/* Variables List */}
        <div className="divide-y divide-border">
          {envVars.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              No environment variables configured.
            </div>
          ) : (
            envVars.map((v, index) => (
              <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-text">{v.key}</span>
                    <div className="flex gap-1">
                      {v.environments.map(env => (
                        <span key={env} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-border text-muted uppercase tracking-wider">
                          {env}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-muted">
                    <span className="font-mono text-xs truncate max-w-md bg-bg px-2 py-1 rounded border border-border/65">
                      {v.hidden ? "••••••••••••••••••••••••••••••••••••••" : v.value}
                    </span>
                    <button
                      onClick={() => toggleHide(index)}
                      className="p-1 rounded hover:bg-bg text-muted hover:text-text transition-colors shrink-0"
                    >
                      {v.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => deleteVar(index)}
                    className="p-2 rounded hover:bg-error/15 text-muted hover:text-error transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4.5 flex gap-3 text-sm text-accent">
        <Shield className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">Security Standard:</strong> All variable values are automatically encrypted with AES-256 before storing. They are only decrypted inside temporary compilation nodes during isolated builds.
        </p>
      </div>
    </div>
  );
}
