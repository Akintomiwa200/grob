"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addDomain(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const name = (formData.get("name") as string)?.toLowerCase().trim();
  if (!name) throw new Error("Domain name is required");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  await prisma.domain.create({
    data: { projectId, name },
  });

  revalidatePath(`/dashboard/projects/${projectId}/domains`);
}

export async function removeDomain(projectId: string, domainId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const domain = await prisma.domain.findFirst({
    where: { id: domainId, project: { userId: session.user.id } },
  });
  if (!domain) throw new Error("Domain not found");

  await prisma.domain.delete({ where: { id: domainId } });

  revalidatePath(`/dashboard/projects/${projectId}/domains`);
}

export async function verifyDomain(projectId: string, domainId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const domain = await prisma.domain.findFirst({
    where: { id: domainId, project: { userId: session.user.id } },
  });
  if (!domain) throw new Error("Domain not found");

  await prisma.domain.update({
    where: { id: domainId },
    data: { verified: true },
  });

  revalidatePath(`/dashboard/projects/${projectId}/domains`);
}
