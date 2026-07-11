import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

const KB_DATA: Record<
  string,
  {
    category: string;
    articles: Record<string, { title: string; content: string }>;
  }
> = {
  "getting-started": {
    category: "Getting Started",
    articles: {
      "first-project": {
        title: "Creating Your First Project",
        content: `## Creating Your First Project

Getting started with Grob takes just a few minutes. This guide walks you through creating and deploying your first project.

### Step 1: Connect Your Repository

1. Navigate to your Dashboard and click **New Project**
2. Select **Git Repository** as the source
3. Authorize Grob to access your GitHub account
4. Select the repository you want to deploy

### Step 2: Configure Your Project

Grob will auto-detect your framework. You can customize:

- **Framework** – Auto-detected or manually selected
- **Build Command** – Default: \`npm run build\`
- **Output Directory** – Default: \`out\` or \`dist\`
- **Install Command** – Default: \`npm install\`

### Step 3: Deploy

Click **Deploy** and Grob will:
1. Clone your repository
2. Install dependencies
3. Run the build command
4. Deploy the output to the edge

Your project will be live at a \`.grob.app\` subdomain within seconds.

### Next Steps

- [Connect a custom domain](/dashboard/support/kb/projects/custom-domains)
- [Set up environment variables](/dashboard/support/kb/getting-started/env-vars)
- [Configure preview deployments](/dashboard/support/kb/getting-started/preview-deployments)`,
      },
      "git-repo": {
        title: "Connecting a Git Repository",
        content: `## Connecting a Git Repository

Grob integrates with GitHub, GitLab, and Bitbucket to provide automatic deployments on every push.

### Supported Providers

| Provider | Auto-Deploy | Pull Requests | Branch Previews |
|----------|:-----------:|:-------------:|:---------------:|
| GitHub   | ✅          | ✅            | ✅              |
| GitLab   | ✅          | ✅            | ✅              |
| Bitbucket| ✅          | ✅            | ✅              |

### Connecting Your Account

1. Go to **Settings → Integrations**
2. Click **Connect** next to your Git provider
3. Complete the OAuth authorization flow
4. Select the repositories you want to grant access to

### Branch Configuration

By default, Grob deploys on pushes to \`main\`. You can configure:

- **Production branch** – Deploys to your production URL
- **Preview branches** – Creates unique preview URLs for other branches
- **Branch patterns** – Use glob patterns like \`feature/**\`

### Disconnecting

To revoke access, go to **Settings → Integrations** and click **Disconnect**. Existing deployments will remain live.`,
      },
      "build-pipeline": {
        title: "Understanding Build & Deploy Pipeline",
        content: `## Build & Deploy Pipeline

Every time you push code, Grob runs a series of steps to build and deploy your application.

### Pipeline Stages

1. **Clone** – Fetches the latest code from your repository
2. **Install** – Runs your install command (e.g., \`npm install\`)
3. **Build** – Executes the build command
4. **Verify** – Checks the output directory exists and contains valid files
5. **Deploy** – Uploads built assets and provisions routes

### Build Logs

View real-time build logs from the Deployment page. Each step is shown with timing information and any errors or warnings.

### Build Errors

Common build failures include:
- Missing output directory
- Exit code non-zero from build command
- Dependency installation failures
- TypeScript compilation errors

Click on any error in the logs to see full stack traces.

### Retries

If a build fails, you can click **Retry** to re-run the entire pipeline without pushing new code.`,
      },
      "env-vars": {
        title: "Environment Variables",
        content: `## Environment Variables

Environment variables let you configure your application without hardcoding values.

### Setting Environment Variables

1. Go to your project → **Settings → Environment Variables**
2. Click **Add Variable**
3. Enter the key and value
4. Choose availability: **All Environments** or **Production Only**

### Runtime Variables

Variables marked as "Build Time" are available during the build step. Variables without this flag are only available at runtime.

### Security

- Environment variable values are encrypted at rest
- Only team members with the **Owner** or **Member** role can view values
- Variables are never exposed to the client bundle unless you explicitly reference them (e.g., \`NEXT_PUBLIC_\` prefix)

### Overriding per Environment

You can set different values for Production, Preview, and Development environments.`,
      },
      "preview-deployments": {
        title: "Preview Deployments",
        content: `## Preview Deployments

Preview deployments let you view changes before merging to production.

### How They Work

When you push to a non-production branch, Grob automatically creates a unique preview URL. These URLs are:
- Unique per branch
- Updated on every push
- Accessible without authentication (by default)

### Pull Request Comments

Grob automatically comments on GitHub/GitLab pull requests with:
- The preview URL
- Build status
- A screenshot (if enabled)

### Protection

You can password-protect preview deployments:
1. Go to **Settings → Deployment Protection**
2. Enable protection
3. Set a shared password

Protected previews require authentication before viewing.`,
      },
      monorepo: {
        title: "Monorepo Support",
        content: `## Monorepo Support

Grob supports monorepo setups including Turborepo, Nx, and Lerna.

### Configuration

In your Grob project settings, specify:
- **Root Directory** – The monorepo package to deploy
- **Build Command** – Include workspace build commands
- **Output Directory** – Path to the built output within the package

### Turborepo Example

\`\`\`
Root Directory: apps/web
Build Command: cd ../.. && turbo run build --filter=web
Output: apps/web/.next
\`\`\`

### Caching

Grob caches node_modules and build outputs between deployments. In monorepos, caches are isolated per package to prevent cross-contamination.`,
      },
    },
  },
  billing: {
    category: "Billing & Plans",
    articles: {
      "free-tier": {
        title: "Free Tier Limits",
        content: `## Free Tier Limits

Grob's free tier includes generous limits for hobby and personal projects.

### Included in Free

- **100 GB** bandwidth per month
- **1,000** build minutes per month
- **Unlimited** preview deployments
- **1** team member
- **Automatic** SSL certificates
- **Global** edge network

### Exceeding Limits

If you exceed free tier limits, deployments will be paused until the next billing cycle. Your existing deployments remain live.

### Upgrading

Visit **Settings → Billing** to upgrade to a Pro or Enterprise plan at any time.`,
      },
      upgrade: {
        title: "Upgrading Your Plan",
        content: `## Upgrading Your Plan

Upgrade at any time from your dashboard.

### How to Upgrade

1. Go to **Settings → Billing**
2. Click **Change Plan**
3. Select your new plan
4. Enter payment details
5. Confirm upgrade

### What Changes

- Increased limits take effect immediately
- Prorated billing for partial months
- Downgrade takes effect at the end of the current billing cycle`,
      },
      "payment-methods": {
        title: "Managing Payment Methods",
        content: `## Payment Methods

Grob accepts all major credit cards.

### Adding a Card

1. Go to **Settings → Billing → Payment Methods**
2. Click **Add Card**
3. Enter card details
4. Click **Save**

### Updating

You can have one primary payment method. To update, add a new card first, then set it as primary, then remove the old card.

### Invoices

View and download past invoices from **Settings → Billing → Invoices**.`,
      },
      "usage-billing": {
        title: "Usage-Based Billing",
        content: `## Usage-Based Billing

Pro and Enterprise plans include usage-based pricing for bandwidth and build minutes.

### How It Works

- **Base fee** covers included usage
- **Overages** are charged at per-unit rates
- **Real-time usage** is visible in your dashboard

### Monitoring Usage

Visit **Settings → Usage** to see current month usage broken down by:
- Bandwidth (GB)
- Build minutes
- Serverless function invocations
- Edge function invocations`,
      },
    },
  },
  projects: {
    category: "Projects & Deployments",
    articles: {
      "deploy-logs": {
        title: "Deployment Logs & Debugging",
        content: `## Deployment Logs

Logs help you diagnose build failures and runtime issues.

### Build Logs

Available during and after the build step. Shows:
- Install output
- Build command output
- Warnings and errors
- Timing for each step

### Runtime Logs

Live logs from your deployed application. Access from the project dashboard under the **Logs** tab.

### Log Retention

- Build logs: 30 days
- Runtime logs: 7 days (free) / 30 days (pro)
- Function logs: 7 days (free) / 90 days (pro)`,
      },
      "custom-domains": {
        title: "Custom Domains",
        content: `## Custom Domains

Use your own domain instead of the default \`.grob.app\` subdomain.

### Adding a Domain

1. Go to your project → **Settings → Domains**
2. Enter your domain name
3. Choose verification method:
   - **DNS Record** – Add a TXT record to your DNS
   - **File Upload** – Upload a verification file

### DNS Configuration

Point your domain to Grob using:

| Record Type | Name | Value |
|------------|------|-------|
| A          | @    | 76.76.21.21 |
| CNAME      | www  | cname.grob.app |

### SSL Certificates

SSL certificates are automatically provisioned and renewed for all custom domains. No configuration needed.

### Wildcard Domains

Enterprise plans support wildcard domains (*.example.com).`,
      },
      rollbacks: {
        title: "Rollbacks & Versioning",
        content: `## Rollbacks

Instantly revert to a previous deployment.

### How to Rollback

1. Go to your project → **Deployments**
2. Find the deployment you want to restore
3. Click the **⋮** menu → **Promote to Production**

Your production URL will immediately point to the selected deployment.

### Deployment History

All deployments are preserved. You can roll back to any previous deployment at any time.

### Instant Rollback

Rollbacks are instant because previous deployments are kept warm on the edge network.`,
      },
      "build-config": {
        title: "Build Configuration",
        content: `## Build Configuration

Customize how Grob builds your project.

### Setting Build Options

Go to **Settings → General** to configure:

- **Framework** – Auto-detected or manual
- **Build Command** – Custom build script
- **Output Directory** – Where built files are placed
- **Install Command** – Custom package manager command
- **Node.js Version** – 18, 20, or 22

### Monorepo Builds

For monorepos, set the **Root Directory** to your app package and update the build command accordingly.

### Build Caching

Grob caches:
- \`node_modules\` – Based on lockfile hash
- Build output – Based on source file hashes

Clear the cache from **Settings → Advanced → Clear Cache**.`,
      },
      serverless: {
        title: "Serverless Functions",
        content: `## Serverless Functions

Add server-side logic to your Grob project.

### Supported Runtimes

- **Node.js** (18, 20, 22)
- **Python** (3.9, 3.10, 3.11)
- **Go**
- **Ruby**

### Creating Functions

Create files in your project's \`api/\` or \`functions/\` directory. Each file becomes a serverless endpoint.

### Limits

| Resource | Free | Pro |
|----------|------|-----|
| Execution time | 10s | 60s |
| Memory | 1024 MB | 3008 MB |
| Payload size | 4.5 MB | 4.5 MB |
| Max instances | 100 | 1000 |`,
      },
    },
  },
  security: {
    category: "Security & Access",
    articles: {
      "team-roles": {
        title: "Team Management & Roles",
        content: `## Team Management

Invite team members to collaborate on projects.

### Roles

| Role | Permissions |
|------|-------------|
| Owner | Full access, billing, team management |
| Member | Deploy, configure projects |
| Viewer | Read-only access to dashboards |

### Inviting Members

1. Go to **Settings → Team**
2. Click **Invite Member**
3. Enter their email address
4. Select a role
5. They'll receive an invitation email

### Removing Members

Owners can remove team members from the Team settings page. Removed members immediately lose access.`,
      },
      sso: {
        title: "Single Sign-On (SSO)",
        content: `## Single Sign-On (SSO)

SSO is available on Enterprise plans.

### Supported Providers

- SAML 2.0
- OpenID Connect (OIDC)

### Setup

Contact our Enterprise team to configure SSO for your organization. We'll guide you through:
1. Configuring your identity provider
2. Mapping user attributes
3. Testing the connection
4. Enforcing SSO for all team members`,
      },
      protection: {
        title: "Deployment Protection",
        content: `## Deployment Protection

Protect preview deployments with authentication.

### How It Works

When enabled, all preview deployments require a password to access. Production deployments are not affected.

### Setup

1. Go to **Settings → Deployment Protection**
2. Toggle **Enable Protection**
3. Set a shared password
4. Share the password with your team

### API Access

Protected deployments can still be accessed via API using a bearer token.`,
      },
    },
  },
  integrations: {
    category: "Integrations",
    articles: {
      github: {
        title: "GitHub Integration",
        content: `## GitHub Integration

Connect your GitHub account for automatic deployments.

### Features

- Auto-deploy on push
- Pull request previews with status checks
- Commit status reporting
- Repository access management

### Setup

1. Go to **Settings → Integrations**
2. Click **Connect GitHub**
3. Authorize the Grob app
4. Select repositories

### Removing the Integration

Go to **Settings → Integrations → GitHub → Disconnect**. You can also remove the Grob app from your GitHub organization settings.`,
      },
      slack: {
        title: "Slack Notifications",
        content: `## Slack Notifications

Get notified about deployments directly in Slack.

### Setup

1. Go to your project → **Settings → Notifications**
2. Click **Add Slack Channel**
3. Authorize the Grob Slack app
4. Select a channel

### Events

You can configure notifications for:
- Deploy started
- Deploy succeeded
- Deploy failed
- Domain added

### Customization

Choose which events trigger notifications per channel.`,
      },
      "deploy-hooks": {
        title: "Deploy Hooks",
        content: `## Deploy Hooks

Trigger deployments from external services using webhook URLs.

### Creating a Deploy Hook

1. Go to your project → **Settings → Git**
2. Scroll to **Deploy Hooks**
3. Enter a name and select a branch
4. Copy the generated URL

### Triggering a Deployment

Send a POST request to the deploy hook URL:

\`\`\`bash
curl -X POST https://api.grob.com/hooks/YOUR_HOOK_ID
\`\`\`

### Security

Deploy hook URLs are secret. Do not expose them in public repositories.`,
      },
      webhooks: {
        title: "Webhooks Configuration",
        content: `## Webhooks

Receive HTTP callbacks when events happen in your Grob account.

### Creating a Webhook

1. Go to your project → **Settings → Webhooks**
2. Click **Add Webhook**
3. Enter the target URL
4. Select events to subscribe to

### Events

- \`deployment.created\`
- \`deployment.succeeded\`
- \`deployment.failed\`
- \`domain.added\`
- \`domain.verified\`

### Payload

Webhook payloads include:
- Event type
- Timestamp
- Resource data
- Signature header for verification

### Retry Policy

Failed webhook deliveries are retried 3 times with exponential backoff.`,
      },
    },
  },
  api: {
    category: "Webhooks & API",
    articles: {
      "api-auth": {
        title: "API Authentication",
        content: `## API Authentication

Authenticate API requests using bearer tokens.

### Creating a Token

1. Go to **Settings → Tokens**
2. Click **Create Token**
3. Name your token
4. Select scopes
5. Copy the token (shown once)

### Using Tokens

Include the token in the Authorization header:

\`\`\`
Authorization: Bearer grob_xxxxxxxxxxxxxxxx
\`\`\`

### Scopes

| Scope | Access |
|-------|--------|
| \`read\` | View projects, deployments, domains |
| \`write\` | Create and modify resources |
| \`admin\` | Full access including deletion |`,
      },
      "rate-limits": {
        title: "API Rate Limits",
        content: `## API Rate Limits

Grob enforces rate limits to ensure fair usage.

### Limits

| Plan | Requests/minute | Requests/day |
|------|:-:|:-:|
| Free | 60 | 10,000 |
| Pro | 600 | 100,000 |
| Enterprise | Custom | Custom |

### Response Headers

Rate limit information is included in response headers:
- \`X-RateLimit-Limit\` – Max requests per window
- \`X-RateLimit-Remaining\` – Remaining requests
- \`X-RateLimit-Reset\` – Time until window resets

### Handling 429 Errors

If you receive a 429 response, wait until the reset time and retry.`,
      },
      "webhook-events": {
        title: "Webhook Events Reference",
        content: `## Webhook Events Reference

Complete reference for all webhook event types.

### Deployment Events

#### deployment.created
Triggered when a new deployment is created.

#### deployment.building
Build has started.

#### deployment.ready
Deployment is live and serving traffic.

#### deployment.error
Build or deployment failed.

### Domain Events

#### domain.created
A new domain was added to a project.

#### domain.verified
Domain DNS verification completed.

#### domain.ssl_provisioned
SSL certificate has been issued.

### Payload Format

\`\`\`json
{
  "type": "deployment.ready",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "id": "dpl_xxx",
    "url": "https://my-project.grob.app"
  }
}
\`\`\``,
      },
      cli: {
        title: "CLI Reference",
        content: `## CLI Reference

The Grob CLI lets you manage projects from the terminal.

### Installation

\`\`\`bash
npm install -g grob-cli
\`\`\`

### Commands

\`\`\`
grob login          # Authenticate with Grob
grob link           # Link current directory to a project
grob deploy         # Deploy the current directory
grob env ls         # List environment variables
grob env add KEY    # Add an environment variable
grob logs           # Stream deployment logs
grob domains ls     # List custom domains
grob rollback       # Rollback to previous deployment
\`\`\`

### Configuration

Create a \`grob.json\` in your project root:

\`\`\`json
{
  "name": "my-project",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
\`\`\``,
      },
    },
  },
};

export default async function KBArticlePage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await props.params;
  const [categorySlug, articleSlug] = slug;

  const category = KB_DATA[categorySlug];
  if (!category) notFound();

  const article = category.articles[articleSlug];
  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/support/kb"
          className="p-2 rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <div>
          <div className="text-xs text-accent font-medium">{category.category}</div>
          <h1 className="text-xl font-semibold text-text">{article.title}</h1>
        </div>
      </div>

      <article className="bg-surface border border-border rounded-xl px-6 py-8">
        <div className="prose prose-sm prose-invert max-w-none
          [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-text [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-text [&_h3]:mt-5 [&_h3]:mb-2
          [&_p]:text-muted [&_p]:leading-relaxed
          [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline
          [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:space-y-1
          [&_li]:text-muted
          [&_pre]:bg-bg [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-sm
          [&_code]:text-accent
          [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
          [&_th]:text-left [&_th]:py-2 [&_th]:px-3 [&_th]:border-b [&_th]:border-border [&_th]:text-text
          [&_td]:py-2 [&_td]:px-3 [&_td]:border-b [&_td]:border-border/50 [&_td]:text-muted
        "
          dangerouslySetInnerHTML={{ __html: simpleMarkdown(article.content) }}
        />
      </article>
    </div>
  );
}

function simpleMarkdown(md: string): string {
  let html = md;
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    "<pre><code>$2</code></pre>"
  );
  html = html.replace(
    /^\|(.+)\|$/gm,
    (match) => {
      const cells = match
        .split("|")
        .filter((c) => c.trim());
      if (cells.every((c) => /^[\s-:]+$/.test(c))) return "";
      return `<tr>${cells.map((c) => `<td>${c.trim()}</td>`).join("")}</tr>`;
    }
  );
  html = html.replace(
    /(<tr>[\s\S]*?<\/tr>\n?)+/g,
    (m) => `<table>${m}</table>`
  );
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^(?!<[hupltao])/gm, "");
  html = html.replace(/\n{2,}/g, "\n");
  return html
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => (l.startsWith("<") ? l : `<p>${l}</p>`))
    .join("\n");
}
