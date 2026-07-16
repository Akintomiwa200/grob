import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      emailVerified: true,
      image: true,
      status: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, username } = body;

  if (username !== undefined) {
    if (username && username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: "Username can only contain letters, numbers, underscores, and hyphens" }, { status: 400 });
    }
    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name: name || null }),
      ...(username !== undefined && { username: username || null }),
    },
    select: { id: true, name: true, username: true, email: true, image: true },
  });

  return NextResponse.json(updated);
}
