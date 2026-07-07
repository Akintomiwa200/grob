"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.create({
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || "",
      gitUrl: (formData.get("gitUrl") as string) || "",
      framework: (formData.get("framework") as string) || "",
      buildCommand: (formData.get("buildCommand") as string) || "npm run build",
      outputDir: (formData.get("outputDir") as string) || ".next",
      installCommand: (formData.get("installCommand") as string) || "npm install",
      userId: session.user.id,
    },
  });

  redirect(`/dashboard/projects/${project.id}`);
}
