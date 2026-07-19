import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.id && !token?.sub) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userId = (token.id || token.sub) as string;

  const res = NextResponse.redirect(
    new URL(
      `https://github.com/login/oauth/authorize?client_id=${process.env.AUTH_GITHUB_ID}&redirect_uri=${encodeURIComponent("http://localhost:3000/api/auth/callback/github")}&scope=${encodeURIComponent("read:user user:email repo")}&state=${encodeURIComponent(JSON.stringify({ flow: "link", ts: Date.now() }))}`,
      req.url
    )
  );

  res.cookies.set("grob-link-github", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 120,
    path: "/",
  });

  return res;
}
