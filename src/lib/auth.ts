import { getServerSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [GitHub as any],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }: any) {
      session.user.id = user.id;
      return session;
    },
  },
};

export const auth = () => getServerSession(authOptions);
