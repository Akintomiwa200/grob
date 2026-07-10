import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
