"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FolderPlus, Globe, Database } from "lucide-react";

export default function AddNewButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
      >
        Add New...
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-bg p-1 shadow-lg z-50">
          <Link
            href="/dashboard/projects/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 w-full rounded-sm px-3 py-2 text-sm text-text hover:bg-white/5 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-muted" />
            Project
          </Link>
          <Link
            href="/dashboard/domains/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 w-full rounded-sm px-3 py-2 text-sm text-text hover:bg-white/5 transition-colors"
          >
            <Globe className="w-4 h-4 text-muted" />
            Domain
          </Link>
          <Link
            href="/dashboard/storage/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 w-full rounded-sm px-3 py-2 text-sm text-text hover:bg-white/5 transition-colors"
          >
            <Database className="w-4 h-4 text-muted" />
            Storage
          </Link>
        </div>
      )}
    </div>
  );
}
