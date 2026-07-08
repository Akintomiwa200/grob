"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addCollaborator(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) throw new Error("Email is required");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) throw new Error("User is already a collaborator");

  await prisma.projectMember.create({
    data: { projectId, userId: user.id, role: "member" },
  });

  revalidatePath(`/dashboard/projects/${projectId}/collaborators`);
}

export async function removeCollaborator(projectId: string, memberId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.projectMember.deleteMany({
    where: { id: memberId, project: { userId: session.user.id } },
  });

  revalidatePath(`/dashboard/projects/${projectId}/collaborators`);
}
