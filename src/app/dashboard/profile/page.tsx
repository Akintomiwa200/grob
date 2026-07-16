import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user!.id },
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

  if (!user) redirect("/login");

  return <ProfileClient profile={user as any} />;
}
