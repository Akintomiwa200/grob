import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createToken, deleteToken } from "./actions";

export default async function TokensPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tokens = await prisma.apiToken.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">API Tokens</h1>
      <p className="text-muted text-sm mb-8">
        Personal access tokens for the Grob API.
      </p>

      <form action={createToken} className="flex gap-3 mb-8">
        <input
          name="name"
          placeholder="Token name"
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
        >
          Generate Token
        </button>
      </form>

      {tokens.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <p className="text-muted text-sm">No tokens created yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div key={token.id} className="p-4 border rounded-xl flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{token.name}</p>
                <p className="font-mono text-xs text-muted mt-0.5">
                  {token.token.slice(0, 12)}...
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Created {new Date(token.createdAt).toLocaleDateString()}
                  {token.lastUsed ? ` · Last used ${new Date(token.lastUsed).toLocaleDateString()}` : " · Never used"}
                </p>
              </div>
              <form action={deleteToken.bind(null, token.id)}>
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
