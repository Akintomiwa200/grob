import { auth } from "@/lib/auth";
import { getRepoFramework } from "@/lib/github";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repoFullName = req.nextUrl.searchParams.get("repo");
  if (!repoFullName) {
    return Response.json({ error: "Repository is required" }, { status: 400 });
  }

  const result = await getRepoFramework(session.user.id, repoFullName);
  if (!result) {
    return Response.json({ error: "Failed to detect framework" }, { status: 500 });
  }

  return Response.json(result);
}
