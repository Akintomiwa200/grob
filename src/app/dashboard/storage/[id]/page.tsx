import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Database, ArrowLeft, Upload, Trash2, File, Folder, HardDrive } from "lucide-react";
import Link from "next/link";

export default async function StorageDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  const bucketName = project ? `bucket-${project.name}` : `bucket-${id.slice(0, 6)}`;

  const files = [
    { name: "avatar-default.png", type: "image/png", size: "24 KB", updated: "2 hours ago" },
    { name: "logo.svg", type: "image/svg+xml", size: "8 KB", updated: "1 day ago" },
    { name: "report-q4.pdf", type: "application/pdf", size: "1.2 MB", updated: "3 days ago" },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/storage" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Storage
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text font-mono">{bucketName}</h1>
            <p className="text-muted text-sm mt-1">Storage bucket managed by {project?.name || "your project"}.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-1.5">
              <Upload className="h-4 w-4" /> Upload
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Files</p>
          <p className="text-2xl font-bold text-text">{files.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Total Size</p>
          <p className="text-2xl font-bold text-text">1.2 MB</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Visibility</p>
          <p className="text-sm font-medium text-text">Public</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Region</p>
          <p className="text-sm font-medium text-text">US East</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
          <h2 className="font-semibold text-text flex items-center gap-2"><Folder className="h-4 w-4 text-accent" /> Files</h2>
          <span className="text-xs text-muted">{files.length} files</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-surface/50 text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">Type</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Size</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Modified</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {files.map((f) => (
              <tr key={f.name} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted" />
                    <span className="font-mono text-text text-xs">{f.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 hidden sm:table-cell"><span className="text-xs text-muted">{f.type}</span></td>
                <td className="px-6 py-3 hidden md:table-cell"><span className="text-xs text-muted">{f.size}</span></td>
                <td className="px-6 py-3 hidden md:table-cell"><span className="text-xs text-muted">{f.updated}</span></td>
                <td className="px-6 py-3 text-right">
                  <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Bucket Settings</h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Bucket Name</label>
            <input defaultValue={bucketName} className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Visibility</label>
            <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm font-medium text-text">Danger Zone</p>
              <p className="text-xs text-muted">Permanently delete this bucket and all its files.</p>
            </div>
            <button className="px-3 py-1.5 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">Delete Bucket</button>
          </div>
        </div>
      </div>
    </div>
  );
}
