const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'agent', title: 'AI Agent', icon: 'Bot', desc: 'Deploy and manage autonomous AI agents for your projects.' },
  { name: 'ai-gateway', title: 'AI Gateway', icon: 'Network', desc: 'Route, rate-limit, and observe your LLM API traffic.' },
  { name: 'analytics', title: 'Analytics', icon: 'BarChart3', desc: 'Real-time traffic and performance analytics for your applications.' },
  { name: 'cdn', title: 'Edge Network', icon: 'Globe', desc: 'Configure caching, routing, and global edge rules.' },
  { name: 'connect', title: 'Connect', icon: 'Plug', desc: 'Manage database connections and secure tunnels.' },
  { name: 'deployments', title: 'Deployments', icon: 'Rocket', desc: 'View deployment history, build logs, and rollback states.' },
  { name: 'env', title: 'Environment Variables', icon: 'Lock', desc: 'Securely manage secrets and environment configurations.' },
  { name: 'firewall', title: 'Web Application Firewall', icon: 'Shield', desc: 'Protect your applications from malicious traffic and DDoS attacks.' },
  { name: 'flags', title: 'Feature Flags', icon: 'Flag', desc: 'Safely roll out new features and run A/B tests.' },
  { name: 'images', title: 'Image Optimization', icon: 'Image', desc: 'Configure automatic image resizing and modern format delivery.' },
  { name: 'integrations', title: 'Integrations', icon: 'Blocks', desc: 'Connect third-party services and marketplace apps.' },
  { name: 'logs', title: 'Logs', icon: 'Terminal', desc: 'Search and filter real-time application and edge logs.' },
  { name: 'observability', title: 'Observability', icon: 'Activity', desc: 'Monitor application health, traces, and custom metrics.' },
  { name: 'sandboxes', title: 'Cloud Sandboxes', icon: 'Box', desc: 'Spin up isolated, instant cloud environments for testing.' },
  { name: 'speed-insights', title: 'Speed Insights', icon: 'Zap', desc: 'Track real user metrics (Core Web Vitals) and performance scores.' },
  { name: 'storage', title: 'Storage', icon: 'Database', desc: 'Manage object storage, edge config, and key-value stores.' },
  { name: 'usage', title: 'Usage & Billing', icon: 'CreditCard', desc: 'Monitor your resource usage and manage billing details.' },
  { name: 'workflows', title: 'Workflows', icon: 'GitMerge', desc: 'Automate tasks with custom CI/CD pipelines and cron jobs.' }
];

const basePath = path.join(__dirname, 'src', 'app', 'dashboard');

pages.forEach(page => {
  const pagePath = path.join(basePath, page.name, 'page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log(`Skipping ${pagePath} - does not exist`);
    return;
  }

  const componentName = page.name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Page';

  const content = `import { ${page.icon}, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ${componentName}() {
  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">${page.title}</h1>
        <p className="text-muted text-sm mt-1">${page.desc}</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/30 px-6 py-16 text-center shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        
        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 shadow-[0_0_30px_rgba(110,91,255,0.2)]">
            <${page.icon} className="h-10 w-10 text-accent" strokeWidth={1.5} />
          </div>
          
          <h2 className="mb-3 text-xl font-semibold text-text">No ${page.title.toLowerCase()} found</h2>
          <p className="mb-8 text-sm text-muted">
            You don't have any active ${page.title.toLowerCase()} yet. Setup is quick and simple, and you can get started right away.
          </p>
          
          <div className="flex w-full flex-col sm:flex-row gap-3">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-text px-4 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="h-4 w-4" /> Create New
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-white/5">
              Read Docs <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(pagePath, content);
  console.log(`Updated ${pagePath}`);
});
