"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createToken(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const name = (formData.get("name") as string) || "Untitled";
  const rawToken = `gro_${crypto.randomUUID().replace(/-/g, "")}`;

  await prisma.apiToken.create({
    data: {
      name,
      token: rawToken,
      scopes: JSON.stringify(["read", "deploy"]),
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard/tokens");
}

export async function deleteToken(tokenId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.apiToken.deleteMany({
    where: { id: tokenId, userId: session.user.id },
  });

  revalidatePath("/dashboard/tokens");
}
