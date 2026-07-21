import { getServerSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
      authorization: {
        params: { scope: "read:user user:email repo" },
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID || "",
      clientSecret: process.env.AUTH_FACEBOOK_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      let linkUserId: string | undefined;
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        linkUserId = cookieStore.get("grob-link-user-id")?.value;
      } catch (e) {
        console.error("Failed to read cookies in jwt callback", e);
      }

      const targetUserId = linkUserId || token.id;

      if (account && targetUserId) {
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: { userId: targetUserId },
          create: {
            userId: targetUserId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            scope: account.scope,
          },
        });

        try {
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          cookieStore.delete("grob-link-user-id");
        } catch (e) {}

        token.id = targetUserId;
        return token;
      }
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }: any) {
      if (session.user) session.user.id = token.id ?? token.sub;
      return session;
    },
  },
};

export const auth = () => getServerSession(authOptions);
