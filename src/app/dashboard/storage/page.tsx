import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Database,
  Upload,
  Search,
  File,
  Folder,
  HardDrive,
  Plus,
  Globe,
  Lock,
  Trash2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Storage | Grob" };

export default async function StoragePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const buckets = await prisma.storageBucket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  const totalBuckets = buckets.length;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Storage</h1>
          <p className="text-muted text-sm mt-1">
            Manage blobs, files, and static assets for your projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/storage/new"
            className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> New Bucket
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Database className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{totalBuckets}</p>
          <p className="text-xs text-muted mt-1">Buckets</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Folder className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {buckets.filter((b) => b.visibility === "public").length}
          </p>
          <p className="text-xs text-muted mt-1">Public Buckets</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <HardDrive className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {buckets.filter((b) => b.visibility === "private").length}
          </p>
          <p className="text-xs text-muted mt-1">Private Buckets</p>
        </div>
      </div>

      {buckets.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/20 p-12 text-center">
          <Database className="h-10 w-10 text-muted mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-text mb-1">No buckets yet</h3>
          <p className="text-sm text-muted mb-4">
            Create a storage bucket to start uploading files and assets.
          </p>
          <Link
            href="/dashboard/storage/new"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> Create your first bucket
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
            <h2 className="font-semibold text-text">Buckets</h2>
            <span className="text-xs text-muted">{totalBuckets} total</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Visibility</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Region</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Created</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {buckets.map((bucket) => (
                <tr key={bucket.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-3">
                    <Link
                      href={`/dashboard/storage/${bucket.id}`}
                      className="flex items-center gap-3 hover:text-accent transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <Folder className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="font-medium text-text font-mono">{bucket.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                        bucket.visibility === "public"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {bucket.visibility === "public" ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {bucket.visibility}
                    </span>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell text-muted text-xs">
                    {bucket.region}
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell text-muted text-xs">
                    {new Date(bucket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/storage/${bucket.id}`}
                        className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
                      >
                        <File className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
