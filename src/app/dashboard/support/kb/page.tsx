import Link from "next/link";
import {
  BookOpen,
  CircleDollarSign,
  AppWindow,
  Lock,
  Plug,
  LifeBuoy,
  Search,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Knowledge Base | Support | Grob" };

const CATEGORIES = [
  {
    name: "Getting Started",
    slug: "getting-started",
    icon: BookOpen,
    description: "Quick start guides, tutorials, and platform basics",
    articles: [
      { title: "Creating Your First Project", slug: "first-project" },
      { title: "Connecting a Git Repository", slug: "git-repo" },
      { title: "Understanding Build & Deploy Pipeline", slug: "build-pipeline" },
      { title: "Environment Variables", slug: "env-vars" },
      { title: "Preview Deployments", slug: "preview-deployments" },
      { title: "Monorepo Support", slug: "monorepo" },
    ],
  },
  {
    name: "Billing & Plans",
    slug: "billing",
    icon: CircleDollarSign,
    description: "Plans, pricing, invoices, and payment methods",
    articles: [
      { title: "Free Tier Limits", slug: "free-tier" },
      { title: "Upgrading Your Plan", slug: "upgrade" },
      { title: "Managing Payment Methods", slug: "payment-methods" },
      { title: "Understanding Usage-Based Billing", slug: "usage-billing" },
    ],
  },
  {
    name: "Projects & Deployments",
    slug: "projects",
    icon: AppWindow,
    description: "Deployment configuration, logs, rollbacks, and more",
    articles: [
      { title: "Deployment Logs & Debugging", slug: "deploy-logs" },
      { title: "Custom Domains", slug: "custom-domains" },
      { title: "Rollbacks & Versioning", slug: "rollbacks" },
      { title: "Build Configuration", slug: "build-config" },
      { title: "Serverless Functions", slug: "serverless" },
    ],
  },
  {
    name: "Security & Access",
    slug: "security",
    icon: Lock,
    description: "Authentication, SSO, permissions, and compliance",
    articles: [
      { title: "Team Management & Roles", slug: "team-roles" },
      { title: "Single Sign-On (SSO)", slug: "sso" },
      { title: "Deployment Protection", slug: "protection" },
    ],
  },
  {
    name: "Integrations",
    slug: "integrations",
    icon: Plug,
    description: "Connect third-party services, Slack, GitHub, and more",
    articles: [
      { title: "GitHub Integration", slug: "github" },
      { title: "Slack Notifications", slug: "slack" },
      { title: "Deploy Hooks", slug: "deploy-hooks" },
      { title: "Webhooks Configuration", slug: "webhooks" },
    ],
  },
  {
    name: "Webhooks & API",
    slug: "api",
    icon: LifeBuoy,
    description: "REST API docs, tokens, and webhook management",
    articles: [
      { title: "API Authentication", slug: "api-auth" },
      { title: "API Rate Limits", slug: "rate-limits" },
      { title: "Webhook Events Reference", slug: "webhook-events" },
      { title: "CLI Reference", slug: "cli" },
    ],
  },
];

export default async function KnowledgeBasePage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await props.searchParams;

  let filtered = CATEGORIES;
  if (q) {
    const query = q.toLowerCase();
    filtered = CATEGORIES.map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          cat.name.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.articles.length > 0);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-text">Knowledge Base</h1>
        <p className="text-muted text-sm">Browse articles and guides to get the most out of Grob</p>
      </div>

      <form action="/dashboard/support/kb" method="GET">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search articles..."
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          />
        </div>
      </form>

      {q && (
        <p className="text-sm text-muted">
          {filtered.reduce((n, c) => n + c.articles.length, 0)} results for &quot;{q}&quot;
        </p>
      )}

      <div className="space-y-8">
        {filtered.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.slug}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-medium text-text">{cat.name}</h2>
              </div>
              <p className="text-sm text-muted mb-3">{cat.description}</p>
              <div className="space-y-1">
                {cat.articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/dashboard/support/kb/${cat.slug}/${article.slug}`}
                    className="block bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
