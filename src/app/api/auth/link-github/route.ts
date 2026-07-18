import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  const cookieStore = await cookies();
  cookieStore.set("grob-link-github", session.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 120,
    path: "/",
  });

  const clientId = process.env.AUTH_GITHUB_ID;
  const redirectUri = encodeURIComponent("http://localhost:3000/api/auth/callback/github");
  const state = encodeURIComponent(JSON.stringify({ flow: "link", ts: Date.now() }));

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user+user:email+repo&state=${state}`
  );
}
