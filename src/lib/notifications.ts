"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return { notifications: [], unreadCount: 0 };

  const notifications = await prisma.userNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      link: true,
      read: true,
      createdAt: true,
    },
  });

  const unreadCount = await prisma.userNotification.count({
    where: { userId: session.user.id, read: false },
  });

  return {
    notifications: notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.userNotification.updateMany({
    where: { id, userId: session.user.id },
    data: { read: true },
  });

  revalidatePath("/dashboard");
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.userNotification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/dashboard");
}

export async function createNotification(
  userId: string,
  data: { title: string; message: string; type?: string; link?: string }
) {
  return prisma.userNotification.create({
    data: { userId, ...data },
  });
}
