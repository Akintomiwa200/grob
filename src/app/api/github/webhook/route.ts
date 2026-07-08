import { auth } from "@/lib/auth";
import { createGitHubWebhook, deleteGitHubWebhook } from "@/lib/github";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoFullName, webhookUrl, secret } = await req.json();

  if (!repoFullName || !webhookUrl) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const hookId = await createGitHubWebhook(session.user.id, repoFullName, webhookUrl, secret || "");
    return Response.json({ hookId });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to create webhook" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoFullName, hookId } = await req.json();

  try {
    await deleteGitHubWebhook(session.user.id, repoFullName, hookId);
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to delete webhook" }, { status: 500 });
  }
}
