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

  await prisma.envVar.deleteMany({ where: { projectId } });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]?.trim();
    if (!key) continue;
    await prisma.envVar.create({
      data: {
        projectId,
        key,
        value: values[i] || "",
        buildTime: true,
      },
    });
  }

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
  const url = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-webhook`;

  await prisma.webhook.create({
    data: {
      projectId,
      url,
      secret,
      events: JSON.stringify(["push"]),
      active: true,
    },
  });

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
      buildCommand: formData.get("buildCommand") as string,
      outputDir: formData.get("outputDir") as string,
      installCommand: formData.get("installCommand") as string,
      framework: (formData.get("framework") as string) || "",
      gitUrl: (formData.get("gitUrl") as string) || "",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}
