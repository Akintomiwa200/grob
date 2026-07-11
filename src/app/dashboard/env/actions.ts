"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addEnvVar(projectId: string, key: string, value: string, buildTime: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  if (!key.trim()) throw new Error("Key is required");

  const existing = await prisma.envVar.findFirst({
    where: { projectId, key: key.trim() },
  });

  if (existing) {
    await prisma.envVar.update({
      where: { id: existing.id },
      data: { value, buildTime },
    });
  } else {
    await prisma.envVar.create({
      data: { projectId, key: key.trim(), value, buildTime },
    });
  }

  revalidatePath("/dashboard/env");
  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

export async function deleteEnvVar(envVarId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const envVar = await prisma.envVar.findFirst({
    where: { id: envVarId, project: { userId: session.user.id } },
  });
  if (!envVar) throw new Error("Variable not found");

  await prisma.envVar.delete({ where: { id: envVarId } });

  revalidatePath("/dashboard/env");
  revalidatePath(`/dashboard/projects/${envVar.projectId}/settings`);
}

export async function toggleBuildTime(envVarId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const envVar = await prisma.envVar.findFirst({
    where: { id: envVarId, project: { userId: session.user.id } },
  });
  if (!envVar) throw new Error("Variable not found");

  await prisma.envVar.update({
    where: { id: envVarId },
    data: { buildTime: !envVar.buildTime },
  });

  revalidatePath("/dashboard/env");
  revalidatePath(`/dashboard/projects/${envVar.projectId}/settings`);
}

export async function saveProjectEnvVars(projectId: string, formData: FormData) {
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
