"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generateUniqueSlug } from "@/lib/slug";

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const repoFullName = (formData.get("repoFullName") as string) || "";
  const defaultBranch = (formData.get("defaultBranch") as string) || "main";
  const createWebhook = formData.has("createWebhook");

  const projectName = (formData.get("name") as string) || "my-project";

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
