"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function addDomain(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const name = (formData.get("name") as string)?.trim();
  const projectId = formData.get("projectId") as string;

  if (!name || !projectId) throw new Error("Domain name and project are required");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  await prisma.domain.create({
    data: {
      name,
      projectId,
    },
  });

  redirect("/dashboard/domains");
}
