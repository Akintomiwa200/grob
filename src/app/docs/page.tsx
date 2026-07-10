import Link from "next/link";
import { ArrowRight, Terminal, GitBranch, Globe, LayoutTemplate } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Getting Started</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Introduction
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Welcome to the Grob documentation. Grob is a modern deployment platform that helps you build, scale, and secure your applications with zero configuration. 
        Whether you are deploying a static site or a complex full-stack Next.js application, Grob handles the infrastructure so you can focus on writing code.
      </p>

      <h2 className="mt-12 mb-6 text-xl font-semibold text-text">Explore</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link 
          href="/docs/quickstart" 
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent hover:bg-accent/5"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-border group-hover:bg-accent/20 transition-colors">
            <Terminal className="h-5 w-5 text-text group-hover:text-accent" />
          </div>
          <h3 className="mb-2 font-medium text-text">Quickstart</h3>
          <p className="text-sm text-muted mb-4 flex-1">
            Learn how to deploy your first application to Grob in less than three minutes.
          </p>
          <div className="flex items-center text-sm font-medium text-accent">
            Read more <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link 
          href="/docs/frameworks" 
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent hover:bg-accent/5"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-border group-hover:bg-accent/20 transition-colors">
            <LayoutTemplate className="h-5 w-5 text-text group-hover:text-accent" />
          </div>
          <h3 className="mb-2 font-medium text-text">Frameworks</h3>
          <p className="text-sm text-muted mb-4 flex-1">
            Discover optimized deployment settings for Next.js, React, Vue, SvelteKit, and more.
          </p>
          <div className="flex items-center text-sm font-medium text-accent">
            Read more <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
        
        <Link 
          href="/docs/git" 
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent hover:bg-accent/5"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-border group-hover:bg-accent/20 transition-colors">
            <GitBranch className="h-5 w-5 text-text group-hover:text-accent" />
          </div>
          <h3 className="mb-2 font-medium text-text">Git Integration</h3>
          <p className="text-sm text-muted mb-4 flex-1">
            Connect your GitHub, GitLab, or Bitbucket repositories for automatic preview deployments.
          </p>
          <div className="flex items-center text-sm font-medium text-accent">
            Read more <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link 
          href="/docs/domains" 
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent hover:bg-accent/5"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-border group-hover:bg-accent/20 transition-colors">
            <Globe className="h-5 w-5 text-text group-hover:text-accent" />
          </div>
          <h3 className="mb-2 font-medium text-text">Custom Domains</h3>
          <p className="text-sm text-muted mb-4 flex-1">
            Add custom domains with automatic SSL certificate provisioning and renewal.
          </p>
          <div className="flex items-center text-sm font-medium text-accent">
            Read more <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      <div className="mt-12 rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-2 font-semibold text-text">Need help?</h3>
        <p className="mb-4 text-sm text-muted">
          Can't find what you're looking for? Our support team is here to help you resolve any issues.
        </p>
        <Link
          href="/login"
          className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
