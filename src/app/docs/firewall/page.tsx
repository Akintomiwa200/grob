"use client";

import { useState } from "react";
import { Shield, ShieldAlert, Plus, Trash2, CheckCircle2, Lock, Terminal, RefreshCw } from "lucide-react";

interface IpRule {
  cidr: string;
  type: "block" | "bypass";
  notes: string;
}

export default function FirewallPage() {
  const [ipRules, setIpRules] = useState<IpRule[]>([
    { cidr: "198.51.100.42/32", type: "block", notes: "Malicious crawler" },
    { cidr: "203.0.113.0/24", type: "block", notes: "DDoS botnet range" }
  ]);
  const [newCidr, setNewCidr] = useState("");
  const [newNotes, setNewNotes] = useState("");
  
  // WAF rules
  const [wafSql, setWafSql] = useState(true);
  const [wafXss, setWafXss] = useState(true);

  // Client Request simulation
  const [simQuery, setSimQuery] = useState("?id=1 UNION SELECT username, password FROM users");
  const [simResult, setSimResult] = useState<{
    status: number;
    message: string;
    ruleId?: string;
    log: string[];
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const addIpRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCidr.trim()) return;

    setIpRules(prev => [...prev, {
      cidr: newCidr.trim(),
      type: "block",
      notes: newNotes.trim() || "Manual block"
    }]);

    setNewCidr("");
    setNewNotes("");
  };

  const removeIpRule = (index: number) => {
    setIpRules(prev => prev.filter((_, i) => i !== index));
  };

  const runFirewallSimulation = async () => {
    setIsSimulating(true);
    setSimResult(null);
    
    await wait(600);
    const log: string[] = [
      "Evaluating edge security headers...",
      "Matching client IP address against active firewall blocks..."
    ];

    // Check if query is SQL Injection
    const sqlKeywords = ["select", "union", "insert", "delete", "where", "or 1=1"];
    const hasSql = sqlKeywords.some(keyword => simQuery.toLowerCase().includes(keyword));

    // Check if query is XSS
    const xssKeywords = ["script", "alert", "onload", "onerror"];
    const hasXss = xssKeywords.some(keyword => simQuery.toLowerCase().includes(keyword));

    if (wafSql && hasSql) {
      log.push("WAF checking query parameters: Detected potential SQL Injection attack.");
      log.push("Request matched WAF rule #WAF-SQL-101.");
      log.push("Aborting request pipeline with code 403.");
      
      setSimResult({
        status: 403,
        message: "Forbidden: Request blocked by WAF rule #WAF-SQL-101 (SQL Injection protection)",
        ruleId: "WAF-SQL-101",
        log
      });
    } else if (wafXss && hasXss) {
      log.push("WAF checking query parameters: Detected potential XSS markup.");
      log.push("Request matched WAF rule #WAF-XSS-102.");
      log.push("Aborting request pipeline with code 403.");
      
      setSimResult({
        status: 403,
        message: "Forbidden: Request blocked by WAF rule #WAF-XSS-102 (Cross-site Scripting protection)",
        ruleId: "WAF-XSS-102",
        log
      });
    } else {
      log.push("WAF matching passed. No security threat found.");
      log.push("Forwarding request payload to serverless router host...");
      
      setSimResult({
        status: 200,
        message: "Success: Request allowed and forwarded to app server.",
        log
      });
    }

    setIsSimulating(false);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Features</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Firewall &amp; Security WAF
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Defend your deployments with Web Application Firewall (WAF) rule sets and real-time IP blacklisting. Mitigate DDoS attacks at edge routers before they touch your application server.
      </p>

      {/* Grid: Rules on Left, WAF tester on Right */}
      <div className="grid gap-6 lg:grid-cols-12 mb-12">
        {/* Left: IP Rules Manager */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl lg:col-span-6 flex flex-col justify-between">
          <div className="border-b border-border bg-bg/40 px-4 py-3 text-xs font-bold text-muted flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-accent" /> IP Firewalls
          </div>

          <form onSubmit={addIpRule} className="p-4 bg-bg/10 border-b border-border space-y-3">
            <div className="grid gap-2 grid-cols-2">
              <input
                type="text"
                placeholder="CIDR e.g. 192.168.1.1/32"
                value={newCidr}
                onChange={(e) => setNewCidr(e.target.value)}
                className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                placeholder="Reason / Notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={!newCidr.trim()}
              className="w-full flex items-center justify-center gap-1 bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Block CIDR Range
            </button>
          </form>

          {/* Block list */}
          <div className="divide-y divide-border/60 max-h-[220px] overflow-y-auto flex-1">
            {ipRules.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">No custom IP blocks.</div>
            ) : (
              ipRules.map((rule, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <code className="font-mono text-text block text-xs">{rule.cidr}</code>
                    <span className="text-[10px] text-muted font-medium">{rule.notes}</span>
                  </div>
                  <button
                    onClick={() => removeIpRule(idx)}
                    className="p-1.5 rounded hover:bg-error/10 text-muted hover:text-error transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: WAF Rules & Simulation */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl lg:col-span-6 flex flex-col justify-between">
          <div className="border-b border-border bg-bg/40 px-4 py-3 text-xs font-bold text-muted flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-accent" /> WAF Rule Configurator
          </div>

          <div className="p-4 border-b border-border space-y-3.5 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-text">SQL Injection Shield (#101)</span>
                <span className="text-[10px] text-muted block mt-0.5">Filters UNION, SELECT, OR injections</span>
              </div>
              <input
                type="checkbox"
                checked={wafSql}
                onChange={(e) => setWafSql(e.target.checked)}
                className="h-4.5 w-4.5 accent-accent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block text-text">Cross-Site Scripting (XSS) Shield (#102)</span>
                <span className="text-[10px] text-muted block mt-0.5">Blocks markup script tags</span>
              </div>
              <input
                type="checkbox"
                checked={wafXss}
                onChange={(e) => setWafXss(e.target.checked)}
                className="h-4.5 w-4.5 accent-accent cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 bg-bg/25 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Simulation Query URL Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={simQuery}
                  onChange={(e) => setSimQuery(e.target.value)}
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text focus:outline-none focus:border-accent"
                />
                <button
                  onClick={runFirewallSimulation}
                  disabled={isSimulating || !simQuery.trim()}
                  className="flex items-center gap-1 bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  Test Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator logs console outputs */}
      {simResult && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-lg mb-12">
          <div className="border-b border-border bg-bg/40 px-4 py-2.5 text-xs font-bold text-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono"><Terminal className="h-3.5 w-3.5 text-accent" /> request-security-log</span>
            {simResult.status === 200 ? (
              <span className="text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> 200 OK</span>
            ) : (
              <span className="text-error flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 animate-bounce" /> 403 Blocked</span>
            )}
          </div>
          
          <div className="p-4 bg-black/95 text-white font-mono text-xs space-y-1 leading-relaxed">
            {simResult.log.map((log, i) => (
              <div key={i} className={log.includes("blocked") || log.includes("Aborting") ? "text-error" : log.includes("passed") ? "text-success" : "text-muted/70"}>
                {log}
              </div>
            ))}
          </div>

          <div className={`p-4 text-xs font-semibold ${simResult.status === 200 ? "bg-success/5 text-success" : "bg-error/5 text-error border-t border-error/10"}`}>
            {simResult.message}
          </div>
        </div>
      )}
    </div>
  );
}
