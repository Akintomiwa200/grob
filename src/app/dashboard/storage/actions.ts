"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBucket(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = (formData.get("name") as string)?.trim().toLowerCase();
  const visibility = (formData.get("visibility") as string) || "public";
  const region = (formData.get("region") as string) || "us-east-1";
  const projectId = (formData.get("projectId") as string) || null;

  if (!name || !/^[a-z0-9\-]+$/.test(name)) {
    throw new Error("Bucket name must contain only lowercase letters, numbers, and hyphens");
  }

  const existing = await prisma.storageBucket.findUnique({
    where: { userId_name: { userId: session.user.id, name } },
  });
  if (existing) {
    throw new Error("A bucket with this name already exists");
  }

  const bucket = await prisma.storageBucket.create({
    data: {
      userId: session.user.id,
      name,
      visibility,
      region,
      projectId: projectId || undefined,
    },
  });

  redirect(`/dashboard/storage/${bucket.id}`);
}

export async function deleteBucket(bucketId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const bucket = await prisma.storageBucket.findFirst({
    where: { id: bucketId, userId: session.user.id },
  });
  if (!bucket) throw new Error("Bucket not found");

  await prisma.storageBucket.delete({ where: { id: bucketId } });
  revalidatePath("/dashboard/storage");
  redirect("/dashboard/storage");
}

export async function updateBucket(bucketId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const visibility = (formData.get("visibility") as string) || "public";

  await prisma.storageBucket.updateMany({
    where: { id: bucketId, userId: session.user.id },
    data: { visibility },
  });

  revalidatePath(`/dashboard/storage/${bucketId}`);
}
