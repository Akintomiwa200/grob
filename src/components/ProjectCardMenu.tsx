"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { renameProject, deleteProject } from "@/app/dashboard/projects/actions";
import {
  Pencil,
  ExternalLink,
  GitBranch,
  Settings,
  Trash2,
  MoreVertical,
} from "lucide-react";

interface Props {
  projectId: string;
  projectName: string;
  slug: string;
}

export default function ProjectCardMenu({ projectId, projectName, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newName, setNewName] = useState(projectName);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (showRename || showDelete) {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setShowRename(false);
          setShowDelete(false);
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [showRename, showDelete]);

  function handleRename() {
    if (!newName.trim() || newName.trim() === projectName) {
      setShowRename(false);
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await renameProject(projectId, newName.trim());
        setShowRename(false);
        setOpen(false);
      } catch (e: any) {
        setError(e.message || "Failed to rename");
      }
    });
  }

  function handleDelete() {
    setError("");
    startTransition(async () => {
      try {
        await deleteProject(projectId);
        setShowDelete(false);
        setOpen(false);
        router.refresh();
      } catch (e: any) {
        setError(e.message || "Failed to delete");
      }
    });
  }

  return (
    <>
      <div
        className="relative"
        ref={menuRef}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => { e.preventDefault(); setOpen(!open); }}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-white/[0.05] hover:text-text transition-colors"
        >
          <MoreVertical size={16} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-xl shadow-lg border border-border py-1 z-50">
            <DropdownItem
              icon={<Pencil size={14} />}
              label="Rename"
              onClick={() => { setShowRename(true); setNewName(projectName); setOpen(false); }}
            />
            <DropdownItem
              icon={<ExternalLink size={14} />}
              label="Visit site"
              onClick={() => { window.open(`http://localhost:3000/p/${slug}`, "_blank"); setOpen(false); }}
            />
            <DropdownItem
              icon={<GitBranch size={14} />}
              label="View deployments"
              onClick={() => { setOpen(false); router.push(`/dashboard/projects/${projectId}`); }}
            />
            <DropdownItem
              icon={<Settings size={14} />}
              label="Settings"
              onClick={() => { setOpen(false); router.push(`/dashboard/projects/${projectId}/settings`); }}
            />
            <div className="h-px bg-border my-1" />
            <DropdownItem
              danger
              icon={<Trash2 size={14} />}
              label="Delete project"
              onClick={() => { setShowDelete(true); setOpen(false); }}
            />
          </div>
        )}
      </div>

      {typeof window !== "undefined" &&
        createPortal(
          <>
            {showRename && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-in fade-in duration-200"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setShowRename(false); }}
              >
                <div
                  className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-150"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-text mb-4">Rename project</h3>
                  {error && <p className="text-sm text-error mb-3">{error}</p>}
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename()}
                    autoFocus
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50 mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRename(false)}
                      className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-white/[0.05] text-text transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRename}
                      disabled={pending || !newName.trim() || newName.trim() === projectName}
                      className="px-4 py-2 text-sm rounded-lg bg-text text-bg font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                      {pending ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showDelete && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-in fade-in duration-200"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setShowDelete(false); }}
              >
                <div
                  className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-150"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-text mb-2">Delete project</h3>
                  <p className="text-sm text-muted mb-4">
                    Are you sure you want to delete <strong className="text-text">{projectName}</strong>? This will permanently remove the project and all its deployments.
                  </p>
                  {error && <p className="text-sm text-error mb-3">{error}</p>}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDelete(false)}
                      className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-white/[0.05] text-text transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={pending}
                      className="px-4 py-2 text-sm rounded-lg bg-error text-white font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                      {pending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>,
          document.body,
        )}
    </>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClick(); }}
      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
        danger
          ? "text-error hover:bg-white/[0.05]"
          : "text-text hover:bg-white/[0.05]"
      }`}
    >
      <span className={danger ? "text-error" : "text-muted"}>{icon}</span>
      {label}
    </button>
  );
}
