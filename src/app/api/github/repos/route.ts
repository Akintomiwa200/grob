import { auth } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repos = await getUserRepos(session.user.id);
  return Response.json(repos);
}
