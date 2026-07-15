import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "online" });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true },
  });

  return NextResponse.json({ status: user?.status || "online" });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();
  if (status !== "online" && status !== "offline") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { status },
  });

  return NextResponse.json({ ok: true, status });
}
