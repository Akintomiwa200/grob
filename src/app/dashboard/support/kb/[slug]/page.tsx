import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CircleDollarSign, AppWindow, Lock, Plug, LifeBuoy } from "lucide-react";
import type { Metadata } from "next";

const ICON_MAP: Record<string, typeof BookOpen> = {
  "getting-started": BookOpen,
  billing: CircleDollarSign,
  projects: AppWindow,
  security: Lock,
  integrations: Plug,
  api: LifeBuoy,
};

const CATEGORIES: Record<
  string,
  {
    name: string;
    description: string;
    articles: { title: string; slug: string; excerpt: string }[];
  }
> = {
  "getting-started": {
    name: "Getting Started",
    description: "Quick start guides, tutorials, and platform basics",
    articles: [
      { title: "Creating Your First Project", slug: "first-project", excerpt: "Learn how to create, configure, and deploy your first project on Grob in minutes." },
      { title: "Connecting a Git Repository", slug: "git-repo", excerpt: "Set up automatic deployments by connecting GitHub, GitLab, or Bitbucket." },
      { title: "Understanding Build & Deploy Pipeline", slug: "build-pipeline", excerpt: "How Grob clones, builds, verifies, and deploys your code." },
      { title: "Environment Variables", slug: "env-vars", excerpt: "Configure your application without hardcoding values." },
      { title: "Preview Deployments", slug: "preview-deployments", excerpt: "View changes before merging to production with unique preview URLs." },
      { title: "Monorepo Support", slug: "monorepo", excerpt: "Deploy from Turborepo, Nx, and Lerna workspaces." },
    ],
  },
  billing: {
    name: "Billing & Plans",
    description: "Plans, pricing, invoices, and payment methods",
    articles: [
      { title: "Free Tier Limits", slug: "free-tier", excerpt: "What's included in the free plan and how to avoid hitting limits." },
      { title: "Upgrading Your Plan", slug: "upgrade", excerpt: "How to upgrade to Pro or Enterprise from your dashboard." },
      { title: "Managing Payment Methods", slug: "payment-methods", excerpt: "Add, update, or remove credit cards and view invoices." },
      { title: "Understanding Usage-Based Billing", slug: "usage-billing", excerpt: "How bandwidth, build minutes, and function invocations are billed." },
    ],
  },
  projects: {
    name: "Projects & Deployments",
    description: "Deployment configuration, logs, rollbacks, and more",
    articles: [
      { title: "Deployment Logs & Debugging", slug: "deploy-logs", excerpt: "Use build and runtime logs to diagnose issues." },
      { title: "Custom Domains", slug: "custom-domains", excerpt: "Use your own domain with automatic SSL provisioning." },
      { title: "Rollbacks & Versioning", slug: "rollbacks", excerpt: "Instantly revert to any previous deployment." },
      { title: "Build Configuration", slug: "build-config", excerpt: "Customize framework, build command, output directory, and more." },
      { title: "Serverless Functions", slug: "serverless", excerpt: "Add server-side logic with Node.js, Python, Go, or Ruby." },
    ],
  },
  security: {
    name: "Security & Access",
    description: "Authentication, SSO, permissions, and compliance",
    articles: [
      { title: "Team Management & Roles", slug: "team-roles", excerpt: "Invite members and manage Owner, Member, and Viewer roles." },
      { title: "Single Sign-On (SSO)", slug: "sso", excerpt: "Enterprise SAML and OIDC single sign-on setup." },
      { title: "Deployment Protection", slug: "protection", excerpt: "Password-protect preview deployments." },
    ],
  },
  integrations: {
    name: "Integrations",
    description: "Connect third-party services, Slack, GitHub, and more",
    articles: [
      { title: "GitHub Integration", slug: "github", excerpt: "Auto-deploy on push with pull request previews." },
      { title: "Slack Notifications", slug: "slack", excerpt: "Get deployment alerts in your Slack channels." },
      { title: "Deploy Hooks", slug: "deploy-hooks", excerpt: "Trigger deployments from external services via webhook URLs." },
      { title: "Webhooks Configuration", slug: "webhooks", excerpt: "Receive HTTP callbacks for account events." },
    ],
  },
  api: {
    name: "Webhooks & API",
    description: "REST API docs, tokens, and webhook management",
    articles: [
      { title: "API Authentication", slug: "api-auth", excerpt: "Create and use bearer tokens for API access." },
      { title: "API Rate Limits", slug: "rate-limits", excerpt: "Request limits per plan and how to handle 429 errors." },
      { title: "Webhook Events Reference", slug: "webhook-events", excerpt: "Complete reference for all webhook event types." },
      { title: "CLI Reference", slug: "cli", excerpt: "Manage projects from the terminal with grob-cli." },
    ],
  },
};

export function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return props.params.then(({ slug }) => ({
    title: `${CATEGORIES[slug]?.name || "Category"} | Knowledge Base | Support | Grob`,
  }));
}

export default async function KBCategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const category = CATEGORIES[slug];
  if (!category) notFound();

  const Icon = ICON_MAP[slug] || BookOpen;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/support/kb"
          className="p-2 rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text">{category.name}</h1>
            <p className="text-sm text-muted">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {category.articles.map((article) => (
          <Link
            key={article.slug}
            href={`/dashboard/support/kb/${slug}/${article.slug}`}
            className="block bg-surface border border-border rounded-xl px-5 py-4 hover:border-accent/50 transition-colors group"
          >
            <div className="font-medium text-text group-hover:text-accent transition-colors">
              {article.title}
            </div>
            <div className="text-sm text-muted mt-1">{article.excerpt}</div>
          </Link>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 text-center space-y-2">
        <p className="text-sm text-muted">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="/dashboard/support/chat" className="text-accent hover:underline">
            Live Chat
          </Link>
          <span className="text-border">·</span>
          <Link href="/dashboard/support/tickets/new" className="text-accent hover:underline">
            Open a Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
