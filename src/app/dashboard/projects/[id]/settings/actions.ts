"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveEnvVars(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  const keys = formData.getAll("key[]") as string[];
  const values = formData.getAll("value[]") as string[];
  const buildTimes = formData.getAll("buildTime[]") as string[];

  await prisma.envVar.deleteMany({ where: { projectId } });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]?.trim();
    if (!key) continue;
    await prisma.envVar.create({
      data: {
        projectId,
        key,
        value: values[i] || "",
        buildTime: buildTimes.includes(String(i)),
      },
    });
  }

  revalidatePath("/dashboard/env");
  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

export async function createWebhook(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  const secret = crypto.randomUUID().slice(0, 16);
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/${project.id}`;

  const wh = await prisma.webhook.create({
    data: {
      projectId,
      url: webhookUrl,
      secret,
      events: JSON.stringify(["push"]),
      active: true,
    },
  });

  const repoFullName = project.gitUrl
    ?.replace("https://github.com/", "")
    ?.replace(".git", "");
  if (repoFullName && repoFullName.includes("/")) {
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
        data: { githubRepo: repoFullName, githubHookId: String(hookId) },
      });
    } catch {
      // webhook created locally but failed on GitHub side
    }
  }

  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

export async function toggleWebhook(projectId: string, webhookId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wh = await prisma.webhook.findFirst({
    where: { id: webhookId, project: { userId: session.user.id } },
  });
  if (!wh) throw new Error("Webhook not found");

  await prisma.webhook.update({
    where: { id: webhookId },
    data: { active: !wh.active },
  });

  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

export async function deleteWebhook(projectId: string, webhookId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wh = await prisma.webhook.findFirst({
    where: { id: webhookId, project: { userId: session.user.id } },
  });

  if (wh?.githubRepo && wh?.githubHookId) {
    try {
      const { deleteGitHubWebhook } = await import("@/lib/github");
      await deleteGitHubWebhook(session.user.id, wh.githubRepo, Number(wh.githubHookId));
    } catch {
      // local delete proceeds even if GitHub API fails
    }
  }

  await prisma.webhook.delete({
    where: { id: webhookId, project: { userId: session.user.id } },
  });

  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

export async function saveProjectConfig(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: (formData.get("name") as string) || project.name,
      description: (formData.get("description") as string) || "",
      buildCommand: formData.get("buildCommand") as string,
      outputDir: formData.get("outputDir") as string,
      installCommand: formData.get("installCommand") as string,
      framework: (formData.get("framework") as string) || "",
      gitUrl: (formData.get("gitUrl") as string) || "",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}/settings`);
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
}

export async function saveProtection(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await prisma.deploymentProtection.findFirst({
    where: { projectId },
  });

  const pw = formData.get("password") as string | null;
  const data: Record<string, unknown> = {
    enabled: formData.has("enabled"),
  };
  if (pw) data.password = pw;
  if (existing) {
    await prisma.deploymentProtection.update({ where: { id: existing.id }, data: data as any });
  } else {
    await prisma.deploymentProtection.create({ data: { projectId, ...data } as any });
  }

  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}
