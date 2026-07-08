import { Octokit } from "octokit";
import { prisma } from "./prisma";

export async function getOctokit(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
  });
  if (!account?.access_token) return null;
  return new Octokit({ auth: account.access_token });
}

export async function getUserRepos(userId: string) {
  const octokit = await getOctokit(userId);
  if (!octokit) return [];

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
