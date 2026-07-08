"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addRedirect(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.projectsRedirect.create({
    data: {
      projectId,
      source: formData.get("source") as string,
      destination: formData.get("destination") as string,
      type: (formData.get("type") as string) || "permanent",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}/redirects`);
}

export async function deleteRedirect(projectId: string, redirectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.projectsRedirect.deleteMany({
    where: { id: redirectId, project: { userId: session.user.id } },
  });

  revalidatePath(`/dashboard/projects/${projectId}/redirects`);
}
