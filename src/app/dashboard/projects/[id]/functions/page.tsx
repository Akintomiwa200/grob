import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { addFunction, deleteFunction, toggleFunctionStatus } from "./actions";

const runtimeColors: Record<string, string> = {
  nodejs: "bg-green-400/10 text-green-400",
  python: "bg-blue-400/10 text-blue-400",
  go: "bg-cyan-400/10 text-cyan-400",
  ruby: "bg-red-400/10 text-red-400",
  rust: "bg-orange-400/10 text-orange-400",
};

const methodColors: Record<string, string> = {
  ANY: "bg-muted/10 text-muted",
  GET: "bg-green-400/10 text-green-400",
  POST: "bg-blue-400/10 text-blue-400",
  PUT: "bg-orange-400/10 text-orange-400",
  PATCH: "bg-purple-400/10 text-purple-400",
  DELETE: "bg-red-400/10 text-red-400",
};

export default async function FunctionsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { functions: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  return (
    <div>
      <Link
        href={`/dashboard/projects/${id}`}
        className="text-sm text-muted hover:text-text mb-1 block"
      >
        &larr; {project.name}
      </Link>
      <h1 className="text-2xl font-bold mb-1">Functions</h1>
      <p className="text-muted text-sm mb-8">
        Manage serverless functions for your project.
      </p>

      <div className="max-w-2xl space-y-6">
        <form
          action={addFunction.bind(null, project.id)}
          className="flex gap-3 items-end flex-wrap"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Route</label>
            <input
              name="name"
              placeholder="api/hello"
              className="w-40 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Method</label>
            <select
              name="method"
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            >
              {["ANY", "GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Runtime</label>
            <select
              name="runtime"
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            >
              {["nodejs", "python", "go", "ruby", "rust"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Source Path</label>
            <input
              name="sourcePath"
              placeholder="api/hello.ts"
              className="w-40 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
          >
            Add
          </button>
        </form>

        {project.functions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted text-sm">No functions configured.</p>
            <p className="text-muted text-xs mt-1">
              Add a function by specifying its route, method, and runtime above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.functions.map((fn) => (
              <div
                key={fn.id}
                className="p-4 border rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded font-mono uppercase ${
                      methodColors[fn.method] || methodColors.ANY
                    }`}
                  >
                    {fn.method}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-sm truncate">{fn.name}</p>
                    <p className="font-mono text-xs text-muted truncate">
                      {fn.sourcePath || fn.name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${
                      runtimeColors[fn.runtime] || "bg-white/[0.05] text-muted"
                    }`}
                  >
                    {fn.runtime}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <form
                    action={toggleFunctionStatus.bind(
                      null,
                      project.id,
                      fn.id,
                      fn.status,
                    )}
                  >
                    <button
                      type="submit"
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                        fn.status === "active"
                          ? "border-green-200 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          : "border-border text-muted hover:bg-white/[0.05]"
                      }`}
                    >
                      {fn.status === "active" ? "Active" : "Disabled"}
                    </button>
                  </form>
                  <form
                    action={deleteFunction.bind(null, project.id, fn.id)}
                  >
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
