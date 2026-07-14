import { Octokit } from "octokit";
import { prisma } from "./prisma";

export async function getOctokit(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
  });
  if (!account?.access_token) return null;
  return new Octokit({ auth: account.access_token });
}

export async function isGitHubConnected(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });
  return !!(account?.access_token);
}

export async function getUserRepos(userId: string) {
  const octokit = await getOctokit(userId);
  if (!octokit) return [];

  try {
    const repos = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 50,
      affiliation: "owner,collaborator",
    });

    return repos.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      updatedAt: repo.updated_at,
      private: repo.private,
    }));
  } catch (error: unknown) {
    const status = typeof error === "object" && error !== null && "status" in error
      ? (error as { status: number }).status
      : null;

    if (status === 401) {
      console.error("GitHub token invalid — removing stale account");
      const account = await prisma.account.findFirst({
        where: { userId, provider: "github" },
        select: { id: true },
      });
      if (account) {
        await prisma.account.delete({ where: { id: account.id } }).catch(() => {});
      }
    }

    console.error("Failed to fetch GitHub repos:", error);
    return [];
  }
}

export async function createGitHubWebhook(
  userId: string,
  repoFullName: string,
  webhookUrl: string,
  secret: string
) {
  const octokit = await getOctokit(userId);
  if (!octokit) throw new Error("GitHub not connected");

  const [owner, repo] = repoFullName.split("/");
  const res = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: "json",
      secret,
    },
    events: ["push"],
    active: true,
  });

  return res.data.id;
}

export async function deleteGitHubWebhook(userId: string, repoFullName: string, hookId: number) {
  const octokit = await getOctokit(userId);
  if (!octokit) throw new Error("GitHub not connected");

  const [owner, repo] = repoFullName.split("/");
  await octokit.rest.repos.deleteWebhook({ owner, repo, hook_id: hookId });
}

export async function getLatestCommit(userId: string, repoFullName: string, branch = "main") {
  const octokit = await getOctokit(userId);
  if (!octokit) return null;

  const [owner, repo] = repoFullName.split("/");
  try {
    const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: branch });
    return {
      sha: data.sha,
      message: data.commit.message.split("\n")[0],
      author: data.commit.author?.name || "unknown",
      date: data.commit.author?.date || new Date().toISOString(),
      branch,
    };
  } catch {
    return null;
  }
}

export async function getRepoFramework(userId: string, repoFullName: string) {
  const octokit = await getOctokit(userId);
  if (!octokit) return null;

  const [owner, repo] = repoFullName.split("/");
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "",
    });

    if (!Array.isArray(data)) return null;

    const files = data.map((item) => item.name);

    // Detect package manager from lockfiles
    let packageManager: "npm" | "pnpm" | "yarn" | "bun" = "npm";
    if (files.includes("pnpm-lock.yaml")) packageManager = "pnpm";
    else if (files.includes("yarn.lock")) packageManager = "yarn";
    else if (files.includes("bun.lockb") || files.includes("bun.lock")) packageManager = "bun";

    const pm = {
      npm:  { install: "npm install",  run: "npm run" },
      pnpm: { install: "pnpm install", run: "pnpm" },
      yarn: { install: "yarn install", run: "yarn" },
      bun:  { install: "bun install",  run: "bun run" },
    }[packageManager];

    if (files.includes("next.config.js") || files.includes("next.config.ts") || files.includes("next.config.mjs")) {
      return { framework: "nextjs", build: `${pm.run} build`, out: ".next", install: pm.install, packageManager };
    }
    if (files.includes("vite.config.js") || files.includes("vite.config.ts")) {
      return { framework: "vite", build: `${pm.run} build`, out: "dist", install: pm.install, packageManager };
    }
    if (files.includes("vue.config.js") || files.includes("nuxt.config.js") || files.includes("nuxt.config.ts")) {
      return { framework: "vue", build: `${pm.run} build`, out: "dist", install: pm.install, packageManager };
    }
    if (files.includes("svelte.config.js")) {
      return { framework: "svelte", build: `${pm.run} build`, out: "build", install: pm.install, packageManager };
    }
    if (files.includes("Cargo.toml")) {
      return { framework: "rust", build: "cargo build --release", out: "target/release", install: "cargo fetch", packageManager: null };
    }
    if (files.includes("go.mod")) {
      return { framework: "go", build: "go build -o main .", out: ".", install: "go mod download", packageManager: null };
    }
    if (files.includes("requirements.txt") || files.includes("pyproject.toml")) {
      return { framework: "python", build: "python -m compileall .", out: ".", install: "pip install -r requirements.txt", packageManager: null };
    }
    if (files.includes("package.json")) {
      return { framework: "node", build: `${pm.run} build`, out: "dist", install: pm.install, packageManager };
    }

    return { framework: "static", build: "", out: ".", install: "", packageManager: null };
  } catch (error) {
    console.error("Error detecting framework:", error);
    return null;
  }
}
