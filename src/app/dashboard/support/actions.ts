"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subject = (formData.get("subject") as string) || "";
  const category = (formData.get("category") as string) || "general";
  const priority = (formData.get("priority") as string) || "normal";
  const body = (formData.get("message") as string) || "";
  const projectId = (formData.get("projectId") as string) || null;

  if (!subject.trim() || !body.trim()) {
    throw new Error("Subject and message are required");
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      subject: subject.trim(),
      category,
      priority,
      projectId: projectId || undefined,
      messages: {
        create: {
          authorId: session.user.id,
          body: body.trim(),
          isAdmin: false,
        },
      },
    },
  });

  redirect(`/dashboard/support/tickets/${ticket.id}`);
}

export async function replyToTicket(ticketId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId: session.user.id },
  });
  if (!ticket) throw new Error("Ticket not found");

  await prisma.ticketReply.create({
    data: {
      ticketId,
      authorId: session.user.id,
      body: body.trim(),
      isAdmin: false,
    },
  });

  revalidatePath(`/dashboard/support/tickets/${ticketId}`);
}

export async function closeTicket(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.supportTicket.updateMany({
    where: { id: ticketId, userId: session.user.id },
    data: { status: "closed" },
  });

  revalidatePath(`/dashboard/support/tickets/${ticketId}`);
}
