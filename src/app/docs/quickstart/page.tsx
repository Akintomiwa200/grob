"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, RefreshCw, Server, Terminal, ShieldCheck, ExternalLink } from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

type Framework = "nextjs" | "vite" | "vue" | "astro" | "svelte" | "django" | "fastapi" | "flask" | "go" | "rust" | "actix" | "laravel" | "rails" | "spring" | "dotnet" | "phoenix" | "flutter" | "hugo";

type LangGroup = "JavaScript / TypeScript" | "Python" | "Go" | "Rust" | "PHP" | "Ruby" | "Java" | ".NET" | "Elixir" | "Dart" | "Static";

const FRAMEWORK_GROUPS: Record<LangGroup, { id: Framework; name: string; desc: string }[]> = {
  "JavaScript / TypeScript": [
    { id: "nextjs", name: "Next.js", desc: "SSR / SSG / Serverless Functions" },
    { id: "vite", name: "React (Vite)", desc: "Optimized Single Page App (SPA)" },
    { id: "vue", name: "Vue / Nuxt", desc: "Reactive Frontend Framework" },
    { id: "astro", name: "Astro", desc: "Content-driven Static Site" },
    { id: "svelte", name: "SvelteKit", desc: "Ultra-lean Compiler Site" },
  ],
  Python: [
    { id: "django", name: "Django", desc: "Full-featured Python Web Framework" },
    { id: "fastapi", name: "FastAPI", desc: "High-performance Async API" },
    { id: "flask", name: "Flask", desc: "Lightweight Python Micro-framework" },
  ],
  Go: [
    { id: "go", name: "Go (Echo / Gin / Fiber)", desc: "Fast Compiled Backend" },
  ],
  Rust: [
    { id: "rust", name: "Rust (Actix / Axum / Rocket)", desc: "Blazingly Fast Backend" },
    { id: "actix", name: "Rust (Leptos)", desc: "Full-stack Rust Framework" },
  ],
  PHP: [
    { id: "laravel", name: "Laravel", desc: "Elegant PHP Full-stack Framework" },
  ],
  Ruby: [
    { id: "rails", name: "Ruby on Rails", desc: "Convention-over-Configuration Web Framework" },
  ],
  Java: [
    { id: "spring", name: "Spring Boot", desc: "Enterprise Java Framework" },
  ],
  ".NET": [
    { id: "dotnet", name: "ASP.NET Core", desc: "Cross-platform .NET Backend" },
  ],
  Elixir: [
    { id: "phoenix", name: "Phoenix (Elixir)", desc: "Fault-tolerant Concurrent Web App" },
  ],
  Dart: [
    { id: "flutter", name: "Flutter (Web)", desc: "Cross-platform UI → Web Build" },
  ],
  Static: [
    { id: "hugo", name: "Hugo", desc: "Blazingly Fast Static Site Generator" },
  ],
};

export default function QuickstartPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFramework, setSelectedFramework] = useState<Framework>("nextjs");
  const [connectedRepo, setConnectedRepo] = useState<string>("");
  const [deployState, setDeployState] = useState<"idle" | "building" | "success">("idle");
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const repos = [
    "alex-dev/nextjs-saas-dashboard",
    "alex-dev/my-vite-portfolio",
    "alex-dev/django-rest-api",
    "alex-dev/go-microservice",
    "alex-dev/rust-axum-server",
    "alex-dev/laravel-dashboard",
    "alex-dev/rails-api",
    "alex-dev/spring-boot-app",
  ];

  const getFrameworkDefaults = (fw: Framework) => {
    const map: Record<Framework, { build: string; output: string; cmd: string }> = {
      nextjs:   { build: "next build", output: ".next", cmd: "next build" },
      vite:     { build: "vite build", output: "dist", cmd: "npm run build" },
      vue:      { build: "nuxt build", output: ".output", cmd: "nuxt build" },
      astro:    { build: "astro build", output: "dist", cmd: "npx astro build" },
      svelte:   { build: "npm run build", output: "build", cmd: "npm run build" },
      django:   { build: "python manage.py collectstatic --noinput", output: "staticfiles", cmd: "python manage.py collectstatic --noinput" },
      fastapi:  { build: "— (None Required)", output: ".", cmd: "uvicorn main:app --host 0.0.0.0 --port 3000" },
      flask:    { build: "— (None Required)", output: ".", cmd: "python app.py" },
      go:       { build: "go build -o server .", output: ".", cmd: "go build -o server ." },
      rust:     { build: "cargo build --release", output: "target/release", cmd: "cargo build --release" },
      actix:    { build: "cargo leptos build --release", output: "target/release", cmd: "cargo leptos build --release" },
      laravel:  { build: "php artisan config:cache", output: "public", cmd: "composer install --no-dev" },
      rails:    { build: "bundle exec rake assets:precompile", output: "public/assets", cmd: "bundle install" },
      spring:   { build: "./mvnw clean package -DskipTests", output: "target", cmd: "./mvnw package" },
      dotnet:   { build: "dotnet publish -c Release -o out", output: "out", cmd: "dotnet restore" },
      phoenix:  { build: "mix assets.deploy", output: "priv/static", cmd: "mix deps.get" },
      flutter:  { build: "flutter build web --release", output: "build/web", cmd: "flutter pub get" },
      hugo:     { build: "hugo --minify", output: "public", cmd: "hugo --minify" },
    };
    return map[fw];
  };

  const startDeployment = async () => {
    const fwDefaults = getFrameworkDefaults(selectedFramework);
    setDeployState("building");
    setDeployLogs([]);
    setProgress(10);
    
    await wait(400);
    addLog("⚡ Initializing build container...");
    setProgress(25);
    
    await wait(500);
    addLog(`📦 Installing dependencies — ${fwDefaults.cmd}`);
    setProgress(45);
    
    await wait(700);
    addLog(`⚙ Compiling bundle & generating routes...`);
    addLog(`  ↳ Running command: ${fwDefaults.build}`);
    setProgress(70);
    
    await wait(900);
    addLog("✔ Assets built successfully.");
    addLog("🚀 Mirroring bundle to 200+ Edge CDN locations...");
    setProgress(90);
    
    await wait(500);
    addLog("🔒 Provisioning auto SSL certificates...");
    setProgress(100);
    
    await wait(400);
    setDeployState("success");
  };

  const addLog = (log: string) => {
    setDeployLogs(prev => [...prev, log]);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const resetWizard = () => {
    setStep(1);
    setConnectedRepo("");
    setDeployState("idle");
    setDeployLogs([]);
    setProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Getting Started</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Quickstart
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Let&apos;s deploy your first application to Grob. Connect your GitHub repository, choose your configuration, and serve it from our global edge network in seconds.
      </p>

      {/* Interactive Deployment Wizard */}
      <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden mb-12">
        {/* Wizard Tabs */}
        <div className="flex border-b border-border bg-bg/40 font-semibold text-sm">
          <button 
            onClick={() => setStep(1)}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 1 ? "border-accent text-accent bg-surface" : "border-transparent text-muted hover:text-text"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-border text-xs font-bold">1</span>
            Select Framework
          </button>
          <button 
            disabled={!selectedFramework}
            onClick={() => setStep(2)}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 2 ? "border-accent text-accent bg-surface" : "border-transparent text-muted hover:text-text disabled:opacity-50"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-border text-xs font-bold">2</span>
            Connect Repository
          </button>
          <button 
            disabled={!connectedRepo}
            onClick={() => setStep(3)}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 3 ? "border-accent text-accent bg-surface" : "border-transparent text-muted hover:text-text disabled:opacity-50"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-border text-xs font-bold">3</span>
            Deploy App
          </button>
        </div>

        {/* Step Contents */}
        <div className="p-6">
          {step === 1 && (
            <div>
              <h3 className="text-base font-bold text-text mb-4">Choose your framework:</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-hidden">
                {(Object.keys(FRAMEWORK_GROUPS) as LangGroup[]).map((group) => (
                  <div key={group}>
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5 px-1">{group}</span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {FRAMEWORK_GROUPS[group].map((fw) => (
                        <button
                          key={fw.id}
                          onClick={() => setSelectedFramework(fw.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedFramework === fw.id
                              ? "border-accent bg-accent/5 ring-1 ring-accent"
                              : "border-border bg-bg/20 hover:border-accent/40"
                          }`}
                        >
                          <span className="block font-bold text-text text-sm mb-0.5">{fw.name}</span>
                          <span className="block text-xs text-muted leading-relaxed">{fw.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-4 py-2 text-sm font-bold hover:brightness-110 shadow-md shadow-accent/15 cursor-pointer"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-base font-bold text-text mb-4">Select GitHub Repository:</h3>
              <div className="flex flex-col gap-2">
                {repos.map((repo) => (
                  <button
                    key={repo}
                    onClick={() => setConnectedRepo(repo)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      connectedRepo === repo
                        ? "border-accent bg-accent/5 ring-1 ring-accent"
                        : "border-border bg-bg/25 hover:border-accent/40"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 font-semibold text-text text-sm">
                      <GithubIcon className="h-4.5 w-4.5 text-muted" />
                      {repo}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      connectedRepo === repo ? "bg-accent/10 text-accent font-bold" : "bg-bg text-muted border border-border"
                    }`}>
                      {connectedRepo === repo ? "Selected" : "Select"}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-text hover:bg-bg transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={!connectedRepo}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-4 py-2 text-sm font-bold hover:brightness-110 disabled:opacity-50 shadow-md shadow-accent/15 cursor-pointer"
                >
                  Configure Build <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              {deployState === "idle" ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-bg/20 p-4">
                    <h4 className="font-bold text-sm text-text mb-3 flex items-center gap-2">
                      <Server className="h-4 w-4 text-accent" /> Build Configuration
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Install Command</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={getFrameworkDefaults(selectedFramework).cmd}
                          className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 font-mono text-muted text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Build Command</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={getFrameworkDefaults(selectedFramework).build}
                          className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 font-mono text-muted text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Output Directory</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={getFrameworkDefaults(selectedFramework).output}
                          className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 font-mono text-muted text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-text hover:bg-bg transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={startDeployment}
                      className="rounded-lg bg-accent text-white px-5 py-2 text-sm font-extrabold hover:brightness-110 transition-all cursor-pointer shadow-md shadow-accent/20"
                    >
                      Trigger Production Deploy
                    </button>
                  </div>
                </div>
              ) : deployState === "building" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-accent" />
                      Deploying {connectedRepo}...
                    </span>
                    <span className="font-mono text-xs text-muted font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div className="bg-accent h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="p-4 bg-black/95 text-white font-mono text-xs rounded-xl min-h-[140px] leading-relaxed">
                    {deployLogs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success mb-4 animate-bounce">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-1">Deployment Successful!</h3>
                  <p className="text-sm text-muted mb-4 leading-relaxed">Your application is live and secured globally via Grob Edge CDN.</p>
                  
                  <div className="inline-flex flex-col gap-2 w-full max-w-sm rounded-xl border border-border bg-bg/25 p-4 text-sm text-left mb-6">
                    <div className="flex justify-between border-b border-border/80 pb-2">
                      <span className="text-muted text-xs">Repo:</span>
                      <span className="font-mono font-semibold text-xs text-text">{connectedRepo}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-muted text-xs">Environment:</span>
                      <span className="font-semibold text-xs text-success flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Production</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={resetWizard}
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:bg-bg transition-all cursor-pointer"
                    >
                      Reset Simulator
                    </button>
                    <a
                      href="https://grob-app.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-accent text-white px-4 py-2 text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-accent/25"
                    >
                      Visit URL <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
