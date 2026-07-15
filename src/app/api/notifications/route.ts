import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

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

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.action === "markRead" && body.id) {
    await prisma.userNotification.updateMany({
      where: { id: body.id, userId: session.user.id },
      data: { read: true },
    });
  } else if (body.action === "markAllRead") {
    await prisma.userNotification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
  }

  return NextResponse.json({ ok: true });
}
