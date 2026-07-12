import { auth } from "@/lib/auth";
import { isGitHubConnected } from "@/lib/github";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ connected: false });
  }

  const connected = await isGitHubConnected(session.user.id);
  return Response.json({ connected });
}
