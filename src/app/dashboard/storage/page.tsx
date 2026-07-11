"use client";

import { useState } from "react";
import {
  Database,
  Upload,
  Search,
  File,
  Folder,
  Image,
  FileText,
  Film,
  Trash2,
  Download,
  MoreHorizontal,
  Plus,
  HardDrive,
  FileCode,
  Archive,
} from "lucide-react";

type StorageFile = {
  id: string;
  name: string;
  type: "file" | "folder" | "image" | "document" | "video" | "code" | "archive";
  size: string;
  modified: string;
};

export default function StoragePage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");

  const buckets = [
    { name: "uploads", files: 234, size: "1.2 GB", public: true },
    { name: "assets", files: 1892, size: "4.8 GB", public: true },
    { name: "backups", files: 12, size: "890 MB", public: false },
    { name: "temp", files: 8, size: "45 MB", public: false },
  ];

  const files: StorageFile[] = [
    { id: "1", name: "hero-banner.webp", type: "image", size: "245 KB", modified: "2 hours ago" },
    { id: "2", name: "documents", type: "folder", size: "—", modified: "1 day ago" },
    { id: "3", name: "api-spec.pdf", type: "document", size: "1.2 MB", modified: "3 days ago" },
    { id: "4", name: "promo-video.mp4", type: "video", size: "18.4 MB", modified: "5 days ago" },
    { id: "5", name: "config.json", type: "code", size: "4.2 KB", modified: "1 week ago" },
    { id: "6", name: "release-v2.zip", type: "archive", size: "34.1 MB", modified: "2 weeks ago" },
    { id: "7", name: "avatar-default.png", type: "image", size: "12 KB", modified: "2 weeks ago" },
    { id: "8", name: "README.md", type: "document", size: "3.1 KB", modified: "3 weeks ago" },
  ];

  const typeIcons = {
    image: { icon: Image, color: "text-purple-500", bg: "bg-purple-500/10" },
    folder: { icon: Folder, color: "text-blue-500", bg: "bg-blue-500/10" },
    document: { icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
    video: { icon: Film, color: "text-red-500", bg: "bg-red-500/10" },
    code: { icon: FileCode, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    archive: { icon: Archive, color: "text-orange-500", bg: "bg-orange-500/10" },
    file: { icon: File, color: "text-muted", bg: "bg-white/5" },
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Upload className="h-4 w-4" /> Upload
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface/30 px-4 py-2.5 text-sm font-medium text-text hover:bg-white/[0.05] transition-colors">
            <Plus className="h-4 w-4" /> New Bucket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Database className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{buckets.length}</p>
          <p className="text-xs text-muted mt-1">Buckets</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <File className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">2,146</p>
          <p className="text-xs text-muted mt-1">Total Files</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <HardDrive className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">6.9 GB</p>
          <p className="text-xs text-muted mt-1">Storage Used</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Download className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">42.8K</p>
          <p className="text-xs text-muted mt-1">Downloads (30d)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface/30">
              <h3 className="text-sm font-semibold text-text">Buckets</h3>
            </div>
            <div className="divide-y divide-border">
              {buckets.map((bucket) => (
                <button
                  key={bucket.name}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="h-4 w-4 text-blue-500" />
                    <div>
                      <span className="text-sm font-medium text-text">{bucket.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted">{bucket.files} files</span>
                        <span className="text-[10px] text-muted">·</span>
                        <span className="text-[10px] text-muted">{bucket.size}</span>
                      </div>
                    </div>
                  </div>
                  {bucket.public && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-medium">
                      Public
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface/30 pl-10 pr-4 py-1.5 text-sm text-text placeholder-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`px-2 py-1 text-xs ${view === "list" ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  ☰
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`px-2 py-1 text-xs ${view === "grid" ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  ⊞
                </button>
              </div>
            </div>
            {view === "list" ? (
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Size</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Modified</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFiles.map((file) => {
                    const typeInfo = typeIcons[file.type];
                    const TypeIcon = typeInfo.icon;
                    return (
                      <tr key={file.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${typeInfo.bg}`}>
                              <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                            </div>
                            <span className="font-medium text-text">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden sm:table-cell text-muted text-xs">{file.size}</td>
                        <td className="px-6 py-3 hidden md:table-cell text-muted text-xs">{file.modified}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
                {filteredFiles.map((file) => {
                  const typeInfo = typeIcons[file.type];
                  const TypeIcon = typeInfo.icon;
                  return (
                    <div
                      key={file.id}
                      className="rounded-lg border border-border p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${typeInfo.bg} mb-3`}>
                        <TypeIcon className={`h-6 w-6 ${typeInfo.color}`} />
                      </div>
                      <p className="text-sm font-medium text-text truncate">{file.name}</p>
                      <p className="text-xs text-muted mt-0.5">{file.size}</p>
                    </div>
                  );
                })}
              </div>
            )}
            {filteredFiles.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Database className="h-6 w-6 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted">No files found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
