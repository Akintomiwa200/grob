"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generateUniqueSlug } from "@/lib/slug";

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const repoFullName = (formData.get("repoFullName") as string) || "";
  const defaultBranch = (formData.get("defaultBranch") as string) || "main";
  const createWebhook = formData.has("createWebhook");

  const projectName = (formData.get("name") as string) || "my-project";

  // Reject duplicate project names for the same user
  const existing = await prisma.project.findFirst({
    where: { userId: session.user.id, name: projectName },
  });
  if (existing) {
    return { error: `A project named "${projectName}" already exists.` };
  }

  // Generate unique slug
  const existingSlugs = (
    await prisma.project.findMany({ select: { slug: true } })
  ).map((p) => p.slug);
  const slug = generateUniqueSlug(projectName, existingSlugs);

  const project = await prisma.project.create({
    data: {
      name: projectName,
      slug,
      description: (formData.get("description") as string) || "",
      gitUrl: (formData.get("gitUrl") as string) || "",
      framework: (formData.get("framework") as string) || "",
      buildCommand: (formData.get("buildCommand") as string) || "npm run build",
      outputDir: (formData.get("outputDir") as string) || ".next",
      installCommand: (formData.get("installCommand") as string) || "npm install",
      userId: session.user.id,
    },
  });

  if (repoFullName && createWebhook) {
    const secret = crypto.randomUUID().slice(0, 16);
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/webhooks/${project.id}`;

    const wh = await prisma.webhook.create({
      data: {
        projectId: project.id,
        url: webhookUrl,
        secret,
        events: JSON.stringify(["push"]),
        active: true,
        githubRepo: repoFullName,
      },
    });

    try {
      const { createGitHubWebhook } = await import("@/lib/github");
      const hookId = await createGitHubWebhook(
        session.user.id,
        repoFullName,
        webhookUrl,
        secret
      );
      await prisma.webhook.update({
        where: { id: wh.id },
        data: { githubHookId: String(hookId) },
      });
    } catch (err) {
      console.error("Failed to create GitHub webhook:", err);
    }
  }

  // Create a deployment record so the build can start immediately
  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "pending",
      branch: defaultBranch,
      commitSha: crypto.randomUUID().slice(0, 40),
      commitMsg: "Initial deploy",
    },
  });

  // Redirect to the deployment page — the TriggerBuild component will start the build
  redirect(`/dashboard/projects/${project.id}/deployments/${deployment.id}`);
}

export async function cleanupDuplicateProjects() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  const seen = new Map<string, string>();
  const toDelete: string[] = [];

  for (const p of projects) {
    if (seen.has(p.name)) {
      toDelete.push(p.id);
    } else {
      seen.set(p.name, p.id);
    }
  }

  if (toDelete.length > 0) {
    await prisma.deployment.deleteMany({ where: { projectId: { in: toDelete } } });
    await prisma.envVar.deleteMany({ where: { projectId: { in: toDelete } } });
    await prisma.domain.deleteMany({ where: { projectId: { in: toDelete } } });
    await prisma.webhook.deleteMany({ where: { projectId: { in: toDelete } } });
    await prisma.cdnCacheRule.deleteMany({ where: { projectId: { in: toDelete } } });
    await prisma.cdnEdgeConfig.deleteMany({ where: { projectId: { in: toDelete } } });
    await prisma.cdnPurgeLog.deleteMany({ where: { projectId: { in: toDelete } } });
    await prisma.project.deleteMany({ where: { id: { in: toDelete } } });
  }

  return { deleted: toDelete.length, kept: seen.size };
}
