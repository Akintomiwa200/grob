"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBucket(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Bucket name is required");

  const visibility = (formData.get("visibility") as string) || "public";
  const region = (formData.get("region") as string) || "us-east-1";

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  await prisma.storageBucket.create({
    data: {
      name,
      visibility,
      region,
      userId: session.user.id,
      projectId,
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}/storage`);
}

export async function deleteBucket(bucketId: string, projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const bucket = await prisma.storageBucket.findFirst({
    where: { id: bucketId, userId: session.user.id },
  });
  if (!bucket) throw new Error("Bucket not found");

  await prisma.storageBucket.delete({ where: { id: bucketId } });

  revalidatePath(`/dashboard/projects/${projectId}/storage`);
}
