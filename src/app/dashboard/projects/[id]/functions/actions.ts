"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addFunction(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.projectFunction.create({
    data: {
      projectId,
      name: formData.get("name") as string,
      method: (formData.get("method") as string) || "ANY",
      runtime: (formData.get("runtime") as string) || "nodejs",
      sourcePath: (formData.get("sourcePath") as string) || "",
      status: "active",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}/functions`);
}

export async function deleteFunction(projectId: string, functionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.projectFunction.deleteMany({
    where: { id: functionId, project: { userId: session.user.id } },
  });

  revalidatePath(`/dashboard/projects/${projectId}/functions`);
}

export async function toggleFunctionStatus(
  projectId: string,
  functionId: string,
  currentStatus: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const newStatus = currentStatus === "active" ? "disabled" : "active";

  await prisma.projectFunction.updateMany({
    where: { id: functionId, project: { userId: session.user.id } },
    data: { status: newStatus },
  });

  revalidatePath(`/dashboard/projects/${projectId}/functions`);
}
