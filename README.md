# Grob

A full-stack deployment platform built with Next.js 16, Prisma, SQLite, and Tailwind CSS. Deploy any application — frontend, backend, full-stack, or static — from any language or framework. Push your code, and Grob builds, deploys, and serves it with zero configuration.

## Features

### Core Platform
- **GitHub Integration** — Import repos, auto-detect 70+ frameworks, register webhooks for auto-deploy on every push
- **Multi-Language Build Pipeline** — Clone, install, build, and deploy any language with full build logs streamed live via SSE
- **Framework Auto-Detection** — Automatically detects your stack from config files and extensions (Next.js, Django, Rails, Spring Boot, Go, Rust, and more)
- **Instant Rollbacks** — One-click rollback to any previous successful deployment
- **Live Deploy Logs** — Real-time streaming build output with status indicators
- **Auto-Deploy Webhooks** — Automatically register webhooks on GitHub repos; every push triggers a deploy
- **Subdomain Routing** — Each project gets a `*.grob.app` subdomain served via edge proxy

### Project Management
- **Project Dashboard** — Create, rename, and manage deployment projects
- **Collaborators** — Invite team members with role-based access
- **Environment Variables** — Per-project secrets with `.env` paste import and auto-rebuild on save
- **Custom Domains** — Add and verify custom domains with automatic SSL provisioning
- **Redirects** — 301/302/rewrite rules per project
- **Deployment Protection** — Password-gated production deploys

### Security & Edge
- **Firewall** — WAF rules (SQL injection, XSS, etc.), IP allow/deny lists, DDoS protection toggle
- **CDN** — Edge caching rules, cache purge, edge configuration per region
- **Custom Domains** — Automatic Let's Encrypt SSL, domain verification

### Developer Tools
- **AI Gateway** — Smart route, secure, cache, and trace LLM prompts with API key management
- **Serverless Functions** — Deploy serverless backend APIs in Node, Go, Python
- **Storage Buckets** — Manage asset blobs with public/private object storage
- **Image Optimization** — On-the-fly resize, format conversion, and compression
- **Feature Flags** — Toggle feature flags per project
- **Workflows** — Automated CI/CD pipeline actions with run history
- **Sandboxes** — Isolated execution environments
- **Observability** — Monitoring and alerting per project
- **Speed Insights** — Core Web Vitals and performance metrics

### Dashboard & Account
- **Profile Management** — Edit name, username, change password, manage connected accounts
- **Auth Providers** — GitHub, Google, Facebook, and email/password login
- **Notifications** — Real-time notification bell with auto-polling, deploy success/failure alerts
- **Status Indicator** — Online/Appear Offline presence with persistence
- **API Tokens** — Personal access tokens for programmatic API access
- **Usage & Analytics** — Deployment stats, success/failure rates, project analytics

### Support System
- **Tickets** — Create and reply to support tickets
- **Knowledge Base** — Browse help articles organized by category
- **Live Chat** — In-dashboard support chat
- **Status Page** — Platform health and uptime monitoring

### Documentation
- **Interactive Docs** — Full documentation site at `/docs` with search (Ctrl+K)
- **15 Doc Sections** — Quickstart, frameworks, Git integration, builds, env vars, domains, regions, caching, serverless, storage, AI gateway, firewall, workflows, image optimization

## Supported Frameworks & Languages

Grob supports **70+ frameworks** across **15+ languages** with automatic detection and optimized build configurations.

### JavaScript / TypeScript
| Framework | Detection |
|-----------|-----------|
| Next.js (+ Static Export) | `next.config.js/ts/mjs` |
| Nuxt | `nuxt.config.js/ts/mjs` |
| SvelteKit | `svelte.config.js/ts/mjs` |
| Remix (+ Vite) | `remix.config.js/ts/mjs` or `vite.config.ts` |
| Astro | `astro.config.mjs/js/ts` |
| Vue.js | `vue.config.js/ts` |
| React (Vite) | `vite.config.js/ts/mjs/cjs` |
| Angular | `angular.json` |
| Gatsby | `gatsby-config.js/ts` |
| Ember.js | `ember-cli-build.js` |
| SolidJS | `solid.config.js/ts` |
| Qwik | `qwik.config.ts/js` |
| Hexo | `_config.yml` + `package.json` |
| Docusaurus | `docusaurus.config.js/ts` |
| VitePress | `docs/.vitepress/config.js/ts` |

### Node.js / Backend
| Framework | Detection |
|-----------|-----------|
| Express.js | `package.json` |
| Fastify | `package.json` |
| NestJS | `nest-cli.json` |
| AdonisJS | `adonisrc.ts/js` |
| Hono | `package.json` |
| Nitro | `nitro.config.ts/js` |
| ElysiaJS (Bun) | `package.json` (Bun runtime) |
| Lynx (Deno) | `deno.json/jsonc` |

### Python
| Framework | Detection |
|-----------|-----------|
| Django | `manage.py` + `settings.py` |
| Flask | `app.py` + `requirements.txt` |
| FastAPI | `main.py` + `requirements.txt` |
| Starlette | `main.py` + `requirements.txt` |
| Sanic | `app.py` + `requirements.txt` |
| Gunicorn | `gunicorn.conf.py` |
| Tornado | `app.py` + `requirements.txt` |

### Go
| Framework | Detection |
|-----------|-----------|
| Go (net/http) | `go.mod` |
| Echo | `go.mod` |
| Gin | `go.mod` |
| Fiber | `go.mod` |

### Rust
| Framework | Detection |
|-----------|-----------|
| Rust (std) | `Cargo.toml` |
| Actix Web | `Cargo.toml` |
| Axum | `Cargo.toml` |
| Rocket | `Cargo.toml` + `Rocket.toml` |
| Warp | `Cargo.toml` |
| Leptos | `Cargo.toml` + `Leptos.toml` |
| Dioxus | `Cargo.toml` + `Dioxus.toml` |

### Ruby
| Framework | Detection |
|-----------|-----------|
| Ruby on Rails | `Gemfile` + `Rakefile` |
| Sinatra | `Gemfile` + `app.rb` |
| Hanami | `Gemfile` + `hanami.rb` |

### PHP
| Framework | Detection |
|-----------|-----------|
| Laravel | `composer.json` + `artisan` |
| Symfony | `composer.json` + `symfony.lock` |
| WordPress | `wp-config.php` |

### Java / Kotlin / Scala
| Framework | Detection |
|-----------|-----------|
| Spring Boot (Maven) | `pom.xml` |
| Spring Boot (Gradle) | `build.gradle(.kts)` |
| Kotlin | `build.gradle.kts` |
| Micronaut | `micronaut-cli.yml` |
| Quarkus | `pom.xml` or `build.gradle` |
| Vert.x | `pom.xml` or `build.gradle` |
| Scala | `build.sbt` |
| Clojure | `project.clj` or `deps.edn` |

### C# / .NET
| Framework | Detection |
|-----------|-----------|
| ASP.NET Core | `*.csproj` |
| Blazor | `*.csproj` + `.razor` files |

### Elixir
| Framework | Detection |
|-----------|-----------|
| Phoenix | `mix.exs` |
| Elixir | `mix.exs` |

### Dart / Flutter
| Framework | Detection |
|-----------|-----------|
| Flutter (Web) | `pubspec.yaml` |
| Dart | `pubspec.yaml` |

### Swift
| Framework | Detection |
|-----------|-----------|
| Vapor | `Package.swift` |

### C / C++
| Framework | Detection |
|-----------|-----------|
| C++ (CMake) | `CMakeLists.txt` |
| C (Make) | `Makefile` |
| Crow | `CMakeLists.txt` |
| Drogon | `CMakeLists.txt` |

### Other Languages
| Framework | Detection |
|-----------|-----------|
| Haskell / Servant / Yesod | `*.cabal` |
| OCaml | `dune-project` |
| Erlang | `rebar.config` |
| Zig | `build.zig` |
| Lua (OpenResty / Lapis) | `nginx.conf` / `rockspec` |
| R (Shiny / Plumber) | `app.R` / `plumber.R` |
| Perl (Dancer2 / Mojolicious) | `cpanfile` |
| WebAssembly | `Cargo.toml` / `CMakeLists.txt` |

### Static Sites
| Type | Detection |
|------|-----------|
| HTML/CSS/JS | `.html` files |
| Hugo | `config.toml` / `hugo.toml` |
| Jekyll | `_config.yml` + `Gemfile` |
| Netlify-style | `netlify.toml` / `vercel.json` |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/installation)
- A [GitHub OAuth App](https://github.com/settings/developers) (for GitHub login)
- Optional: Google OAuth App (for Google login)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Akintomiwa200/grob.git
cd grob
pnpm install
```

### 2. Create a GitHub OAuth App

1. Go to **GitHub Settings** → **Developer settings** → **[OAuth Apps](https://github.com/settings/developers)** → **New OAuth App**
2. Fill in the form:
   - **Application name**: `Grob (Dev)`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**
4. Copy the **Client ID** and generate a **Client Secret**

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
# Database (SQLite — no changes needed for local dev)
DATABASE_URL="file:./prisma/dev.db"

# Auth
AUTH_SECRET="generate-a-random-secret-here"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Optional: Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Optional: Facebook OAuth
AUTH_FACEBOOK_ID="your-facebook-app-id"
AUTH_FACEBOOK_SECRET="your-facebook-app-secret"
```

Generate a secure `AUTH_SECRET`:

```bash
# macOS / Linux
openssl rand -hex 32

# Windows (PowerShell)
-join ((48..57) + (97..102) | Get-Random -Count 32 | % {[char]$_})
```

### 4. Initialize the database

```bash
pnpm prisma db push
```

This creates the SQLite database at `prisma/dev.db` with all 32 models.

### 5. Start the dev server

```bash
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handler (GitHub, Google, Facebook, Credentials)
│   │   ├── auth/register/          # Email/password registration
│   │   ├── auth/check-email/       # Email existence check
│   │   ├── deploy/trigger/[id]/    # Trigger a deployment build
│   │   ├── deployments/[id]/       # Deployment details
│   │   ├── github/
│   │   │   ├── repos/              # List user's GitHub repos
│   │   │   ├── webhook/            # Create/delete GitHub webhooks
│   │   │   ├── status/             # Check GitHub connection
│   │   │   └── detect-framework/   # Auto-detect project framework
│   │   ├── notifications/          # Notification CRUD + polling
│   │   ├── projects/deployments/   # Log polling, SSE streaming, status
│   │   ├── user/
│   │   │   ├── profile/            # GET/PATCH user profile
│   │   │   ├── password/           # Change password
│   │   │   ├── status/             # Online/offline presence
│   │   │   └── delete/             # Account deletion
│   │   └── webhooks/[projectId]/   # Incoming GitHub webhook receiver
│   ├── dashboard/
│   │   ├── layout.tsx              # Auth guard + sidebar + navbar
│   │   ├── page.tsx                # Project list overview
│   │   ├── profile/                # User profile (name, username, password, delete)
│   │   ├── settings/               # Account settings, API tokens
│   │   ├── deployments/            # All deployments across projects
│   │   ├── logs/                   # Global log viewer
│   │   ├── analytics/              # Deployment analytics
│   │   ├── firewall/               # Global firewall config
│   │   ├── cdn/                    # Global CDN config
│   │   ├── env/                    # Global environment variables
│   │   ├── domains/                # Domain management
│   │   ├── integrations/           # Slack, GitHub, Discord, Teams, Jira
│   │   ├── storage/                # Storage buckets
│   │   ├── images/                 # Image optimization
│   │   ├── workflows/              # CI/CD workflows
│   │   ├── ai-gateway/             # AI gateway routes & keys
│   │   ├── flags/                  # Feature flags
│   │   ├── sandboxes/              # Sandboxed environments
│   │   ├── observability/          # Monitoring & alerts
│   │   ├── speed-insights/         # Core Web Vitals
│   │   ├── usage/                  # Usage & billing
│   │   ├── support/                # Tickets, chat, KB, status
│   │   └── projects/
│   │       ├── new/                # Create project with GitHub import
│   │       └── [id]/
│   │           ├── page.tsx        # Project detail + deploy button
│   │           ├── deployments/    # Per-project deployments
│   │           ├── settings/       # Build config, env vars, webhooks
│   │           ├── domains/        # Custom domain management
│   │           ├── collaborators/  # Team member management
│   │           ├── firewall/       # WAF rules, IP lists, DDoS
│   │           ├── cdn/            # Cache rules, purge, edge config
│   │           ├── env/            # Environment variables + paste import
│   │           ├── integrations/   # Connected services
│   │           ├── storage/        # Object storage
│   │           ├── functions/      # Serverless functions
│   │           ├── workflows/      # CI/CD workflows
│   │           ├── images/         # Image optimization
│   │           ├── redirects/      # URL redirect rules
│   │           ├── logs/           # Log viewer
│   │           ├── analytics/      # Per-project analytics
│   │           ├── observability/  # Per-project monitoring
│   │           └── speed-insights/ # Per-project performance
│   ├── docs/                       # 15-section documentation site
│   ├── login/                      # Sign-in page (social + email/password)
│   ├── p/[slug]/[[...path]]/       # Subdomain-served deployed sites
│   └── page.tsx                    # Landing page with hero, pipeline, features
├── components/
│   ├── Navbar.tsx                  # Dashboard navbar (project switcher, notifications, status)
│   ├── Sidebar.tsx                 # Dashboard sidebar (desktop + mobile drawer)
│   ├── PublicNavbar.tsx            # Public-facing navbar (landing, docs)
│   ├── ProjectCardMenu.tsx         # Project card context menu (rename, delete)
│   ├── AddNewButton.tsx            # Reusable "add new" dropdown
│   ├── Pipeline.tsx                # CI/CD pipeline visualization
│   ├── PowerfulFeatures.tsx        # Feature showcase section
│   ├── FAQ.tsx                     # FAQ accordion
│   └── ContactFooter.tsx           # Contact section footer
├── lib/
│   ├── auth.ts                     # NextAuth config (4 providers, JWT, Prisma adapter)
│   ├── prisma.ts                   # Prisma client singleton
│   ├── github.ts                   # Octokit GitHub API helpers
│   ├── build.ts                    # Build/deploy pipeline logic
│   ├── notifications.ts            # Notification server actions
│   ├── languages.ts                # Language/framework definitions
│   ├── slug.ts                     # Slug generation utilities
│   ├── ai-gateway-actions.ts       # AI gateway server actions
│   ├── image-actions.ts            # Image optimization actions
│   └── workflow-actions.ts         # Workflow server actions
└── generated/prisma/               # Auto-generated Prisma client
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with design tokens |
| **Database** | SQLite via [Prisma ORM](https://www.prisma.io/) 7 with LibSQL adapter |
| **Auth** | [NextAuth.js v4](https://next-auth.js.org/) (GitHub, Google, Facebook, Credentials) |
| **GitHub API** | [Octokit](https://github.com/octokit/octokit.js) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Email** | [Nodemailer](https://nodemailer.com/) (optional SMTP) |
| **Password Hashing** | [bcryptjs](https://www.npmjs.com/package/bcryptjs) |

## Usage

### Creating a project

1. Sign in with GitHub, Google, or email/password
2. Click **New Project**
3. Browse your GitHub repos in the **Import from GitHub** section
4. Click a repo to auto-fill the form (framework is auto-detected)
5. Check **Auto-create webhook** to deploy on every push
6. Click **Create Project**

### Deploying

- Click **Deploy** on any project to trigger a manual build
- Push to your GitHub repo to trigger an auto-deploy via webhook
- View live build logs in real-time via SSE streaming

### Environment Variables

1. Navigate to your project → **Environment Variables**
2. Click **Paste .env** to bulk-import from a `.env` file
3. Variables are parsed automatically (handles comments, quotes, multiline)
4. Saving triggers an automatic rebuild with the new variables

### Custom Domains

1. Navigate to your project → **Domains**
2. Add your domain name
3. Add the DNS records shown (A record or CNAME)
4. SSL is provisioned automatically via Let's Encrypt

### Firewall

1. Navigate to your project → **Firewall**
2. Toggle WAF rules (SQL injection, XSS, path traversal, etc.)
3. Add IP addresses to allow/deny lists
4. Enable/disable DDoS protection

## Database

The app uses SQLite with 32 Prisma models:

`User` · `Account` · `Session` · `VerificationToken` · `ApiToken` · `Project` · `ProjectMember` · `Domain` · `EnvVar` · `Webhook` · `NotificationChannel` · `DeploymentProtection` · `ProjectsRedirect` · `ProjectFunction` · `Deployment` · `SupportTicket` · `TicketReply` · `StorageBucket` · `CdnCacheRule` · `CdnEdgeConfig` · `CdnPurgeLog` · `AiGatewayRoute` · `AiGatewayKey` · `AiGatewayLog` · `Workflow` · `WorkflowRun` · `OptimizedImage` · `FirewallWafRule` · `FirewallIpEntry` · `FirewallDdosConfig` · `UserNotification` · `ProjectIntegration`

## Scripts

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Generate Prisma client + production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## License

[MIT](LICENSE)
