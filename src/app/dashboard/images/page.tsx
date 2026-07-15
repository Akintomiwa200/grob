import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getImageStats } from "@/lib/image-actions";
import { ImagesClient } from "./ImagesClient";

export default async function ImagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [images, stats] = await Promise.all([
    prisma.optimizedImage.findMany({
      where: { project: { userId } },
      orderBy: { createdAt: "desc" },
    }),
    getImageStats(userId),
  ]);

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight text-text">Images</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Beta
          </span>
        </div>
        <p className="text-muted text-sm">
          Automatic image optimization with on-the-fly resizing, format conversion, and CDN delivery.
        </p>
      </div>

      <ImagesClient
        initialImages={images.map((img) => ({
          ...img,
          createdAt: img.createdAt.toISOString(),
        }))}
        stats={stats}
      />
    </div>
  );
}
