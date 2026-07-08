"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addNotification(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.notificationChannel.create({
    data: {
      projectId,
      type: (formData.get("type") as string) || "slack",
      url: formData.get("url") as string,
      events: JSON.stringify(["deploy.success", "deploy.failed"]),
      active: true,
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}/notifications`);
}

export async function deleteNotification(projectId: string, notifId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.notificationChannel.deleteMany({
    where: { id: notifId, project: { userId: session.user.id } },
  });

  revalidatePath(`/dashboard/projects/${projectId}/notifications`);
}

export async function toggleNotification(projectId: string, notifId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const ch = await prisma.notificationChannel.findFirst({
    where: { id: notifId, project: { userId: session.user.id } },
  });
  if (!ch) throw new Error("Not found");

  await prisma.notificationChannel.update({
    where: { id: notifId },
    data: { active: !ch.active },
  });

  revalidatePath(`/dashboard/projects/${projectId}/notifications`);
}
