import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user!.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user!.id },
    select: { status: true },
  });

  return (
    <DashboardClient
      session={session}
      projects={projects}
      userStatus={(user?.status as "online" | "offline") || "online"}
    >
      {children}
    </DashboardClient>
  );
}
