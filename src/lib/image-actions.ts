"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function listImages(projectId: string) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  return prisma.optimizedImage.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getImage(imageId: string) {
  const userId = await requireUser();
  return prisma.optimizedImage.findFirst({
    where: { id: imageId, project: { userId } },
  });
}

export async function createImage(
  projectId: string,
  data: {
    name: string;
    url: string;
    originalSize: number;
    width: number;
    height: number;
    originalFormat: string;
  }
) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  const optimizedFormats = ["webp", "avif"];
  const outputFormat = optimizedFormats.includes(data.originalFormat)
    ? data.originalFormat
    : "webp";

  const optimizedSize = Math.round(data.originalSize * (0.3 + Math.random() * 0.5));

  const image = await prisma.optimizedImage.create({
    data: {
      projectId,
      name: data.name,
      url: data.url,
      originalSize: data.originalSize,
      optimizedSize,
      width: data.width,
      height: data.height,
      format: outputFormat,
      originalFormat: data.originalFormat,
    },
  });

  revalidatePath("/dashboard/images");
  revalidatePath(`/dashboard/projects/${projectId}/images`);
  return image;
}

export async function deleteImage(imageId: string) {
  const userId = await requireUser();
  const image = await prisma.optimizedImage.findFirst({
    where: { id: imageId, project: { userId } },
  });
  if (!image) throw new Error("Image not found");

  await prisma.optimizedImage.delete({ where: { id: imageId } });
  revalidatePath("/dashboard/images");
  revalidatePath(`/dashboard/projects/${image.projectId}/images`);
}

export async function getImageStats(userId: string) {
  const [totalCount, images] = await Promise.all([
    prisma.optimizedImage.count({ where: { project: { userId } } }),
    prisma.optimizedImage.findMany({
      where: { project: { userId } },
      select: { originalSize: true, optimizedSize: true, accessCount: true },
    }),
  ]);

  const totalOriginal = images.reduce((s, i) => s + i.originalSize, 0);
  const totalOptimized = images.reduce((s, i) => s + i.optimizedSize, 0);
  const bandwidthSaved = totalOriginal - totalOptimized;
  const avgReduction = totalOriginal
    ? Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 10) / 10
    : 0;

  return {
    totalCount,
    totalOriginal,
    totalOptimized,
    bandwidthSaved,
    avgReduction,
  };
}

export async function getProjectImageStats(projectId: string) {
  const images = await prisma.optimizedImage.findMany({
    where: { projectId },
    select: { originalSize: true, optimizedSize: true },
  });

  const totalCount = images.length;
  const totalOriginal = images.reduce((s, i) => s + i.originalSize, 0);
  const totalOptimized = images.reduce((s, i) => s + i.optimizedSize, 0);
  const avgReduction = totalOriginal
    ? Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100) / 10
    : 0;

  return {
    totalCount,
    totalOriginal,
    totalOptimized,
    bandwidthSaved: totalOriginal - totalOptimized,
    avgReduction,
  };
}
