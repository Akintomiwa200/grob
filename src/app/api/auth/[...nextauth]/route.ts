import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const handler = NextAuth(authOptions);

export async function GET(
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const url = new URL(req.url);
  const params = await context.params;
  const segments = params.nextauth;

  if (segments[0] === "callback" && segments[1] === "github") {
    const cookieStore = await cookies();
    const linkUserId = cookieStore.get("grob-link-github")?.value;

    if (linkUserId) {
      const code = url.searchParams.get("code");
      cookieStore.delete("grob-link-github");

      if (!code) {
        return NextResponse.redirect(new URL("/dashboard/profile?error=missing_code", url.origin));
      }

      try {
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            client_id: process.env.AUTH_GITHUB_ID,
            client_secret: process.env.AUTH_GITHUB_SECRET,
            code,
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error("No access token");

        const userRes = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "grob-app",
          },
        });

        const gh = await userRes.json();
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: "github",
              providerAccountId: String(gh.id),
            },
          },
          update: {
            userId: linkUserId,
            access_token: tokenData.access_token,
            scope: tokenData.scope || "read:user user:email repo",
            token_type: tokenData.token_type || "bearer",
          },
          create: {
            userId: linkUserId,
            type: "oauth",
            provider: "github",
            providerAccountId: String(gh.id),
            access_token: tokenData.access_token,
            scope: tokenData.scope || "read:user user:email repo",
            token_type: tokenData.token_type || "bearer",
          },
        });

        return NextResponse.redirect(new URL("/dashboard/profile?connected=github", url.origin));
      } catch (e) {
        console.error("Link GitHub error:", e);
        return NextResponse.redirect(new URL("/dashboard/profile?error=link_failed", url.origin));
      }
    }
  }

  return handler(req, context);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return handler(req, context);
}
