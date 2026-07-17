"use client";

import { useState } from "react";
import { Database, Plus, Trash2, ShieldCheck, Key, Lock, Eye } from "lucide-react";

interface BlobFile {
  name: string;
  size: string;
  type: string;
  signedUrl?: string;
  expiresIn?: number;
}

export default function StoragePage() {
  const [bucketName, setBucketName] = useState("assets-bucket");
  const [isPrivate, setIsPrivate] = useState(true);
  const [files, setFiles] = useState<BlobFile[]>([
    { name: "grob-logo-dark.png", size: "48.2 KB", type: "image/png" },
    { name: "financial-report.pdf", size: "1.45 MB", type: "application/pdf" },
    { name: "user-avatar-placeholder.svg", size: "4.1 KB", type: "image/svg+xml" }
  ]);
  const [newFileName, setNewFileName] = useState("");
  const [newFileSize, setNewFileSize] = useState("120 KB");

  const deleteFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMockFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    setFiles(prev => [...prev, {
      name: newFileName.trim(),
      size: newFileSize,
      type: newFileName.includes(".") ? `application/${newFileName.split(".").pop()}` : "application/octet-stream"
    }]);

    setNewFileName("");
  };

  const generateSignedUrl = (index: number) => {
    setFiles(prev => prev.map((file, i) => {
      if (i === index) {
        const randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return {
          ...file,
          signedUrl: `https://storage.grob.dev/b/${bucketName}/o/${file.name}?token=${randomToken}&expires=300`,
          expiresIn: 300
        };
      }
      return file;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Features</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Storage Buckets
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Securely upload, store, and serve asset files and blobs. Create public buckets for frontend media optimization, or private storage buckets requiring expiring signed URLs.
      </p>

      {/* Storage panel */}
      <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
        <Database className="h-5 w-5 text-accent" /> Object Storage Explorer
      </h2>
      <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden mb-12">
        {/* Bucket setup header */}
        <div className="border-b border-border bg-bg/40 p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Database className="h-5 w-5 text-accent shrink-0" />
            <input
              type="text"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              className="bg-transparent border-b border-border/80 text-text font-bold font-mono focus:outline-none focus:border-accent text-sm w-44"
              placeholder="bucket-name"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-muted">Access Level:</span>
            <button
              onClick={() => setIsPrivate(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                isPrivate
                  ? "bg-error/10 border-error/20 text-error"
                  : "bg-surface border-border text-muted hover:text-text"
              }`}
            >
              <Lock className="h-3.5 w-3.5" /> Private
            </button>
            <button
              onClick={() => setIsPrivate(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                !isPrivate
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-surface border-border text-muted hover:text-text"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Public Read
            </button>
          </div>
        </div>

        {/* Upload form */}
        <form onSubmit={uploadMockFile} className="p-4 bg-bg/15 border-b border-border flex flex-wrap gap-2.5 items-center">
          <input
            type="text"
            placeholder="File name (e.g. invoice-4.pdf)"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="flex-1 min-w-[200px] bg-surface border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text focus:outline-none focus:border-accent"
          />
          <select
            value={newFileSize}
            onChange={(e) => setNewFileSize(e.target.value)}
            className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text focus:outline-none"
          >
            <option value="4.5 KB">4.5 KB</option>
            <option value="210 KB">210 KB</option>
            <option value="1.8 MB">1.8 MB</option>
            <option value="12.5 MB">12.5 MB</option>
          </select>
          <button
            type="submit"
            disabled={!newFileName.trim()}
            className="flex items-center gap-1 rounded-lg bg-accent text-white px-3.5 py-1.5 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-accent/15"
          >
            <Plus className="h-3.5 w-3.5" /> Upload File
          </button>
        </form>

        {/* Files list */}
        <div className="divide-y divide-border">
          {files.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              Bucket is empty. Upload a file above to verify.
            </div>
          ) : (
            files.map((file, idx) => (
              <div key={idx} className="p-4.5 text-sm flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="font-mono text-text font-bold truncate">{file.name}</span>
                    <span className="text-[10px] text-muted shrink-0 font-semibold bg-bg border border-border px-1.5 py-0.5 rounded-full">{file.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPrivate && (
                      <button
                        onClick={() => generateSignedUrl(idx)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-accent/20 hover:border-accent text-accent hover:bg-accent/5 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Key className="h-3.5 w-3.5" /> Generate Signed Link
                      </button>
                    )}
                    <button
                      onClick={() => deleteFile(idx)}
                      className="p-1.5 rounded hover:bg-error/15 text-muted hover:text-error transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* If signed URL exists */}
                {file.signedUrl && isPrivate && (
                  <div className="mt-1 p-3 bg-black/95 rounded-lg font-mono text-[11px] text-success overflow-x-auto select-all leading-normal">
                    <div className="flex justify-between text-[9px] font-bold text-muted/65 uppercase tracking-wider mb-1.5 border-b border-border/10 pb-1">
                      <span>Expiring URL (5 Minutes)</span>
                      <span>active</span>
                    </div>
                    {file.signedUrl}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-success/20 bg-success/5 p-4.5 flex gap-3 text-sm text-success">
        <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-semibold">
          Cloud Storage Integration: Assets are stored securely inside AWS S3 or Supabase Storage configurations automatically matching regional parameters. Expiring signed keys utilize cryptography signatures ensuring they cannot be spoofed.
        </p>
      </div>
    </div>
  );
}
