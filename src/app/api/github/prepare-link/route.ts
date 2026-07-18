import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("grob-link-user-id", session.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  // Try to parse redirect destination
  try {
    const body = await request.json().catch(() => ({}));
    if (body.redirectTo) {
      cookieStore.set("grob-link-redirect", body.redirectTo, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10,
        path: "/",
      });
    }
  } catch (e) {}

  return NextResponse.json({ success: true });
}
