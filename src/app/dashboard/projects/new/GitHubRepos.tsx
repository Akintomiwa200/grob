"use client";

import { useEffect, useState } from "react";
import { Skeleton, SkeletonLine } from "@/components/Skeleton";

type GitHubRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  language: string | null;
  private: boolean;
};

export function GitHubRepos({
  onSelect,
}: {
  onSelect: (repo: GitHubRepo) => void;
}) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetch("/api/github/status")
      .then((r) => r.json())
      .then((data) => {
        setConnected(data.connected);
        if (!data.connected) {
          setLoading(false);
          return null;
        }
        return fetch("/api/github/repos");
      })
      .then((r) => r?.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
          if (data.length === 0) setConnected(false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="border border-border rounded-xl bg-bg overflow-hidden animate-pulse">
        <div className="p-3 border-b border-border bg-surface/30 rounded-t-xl flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded shrink-0" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
        <div className="max-h-[400px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4 border-b border-border last:border-b-0">
              <div className="flex-1 space-y-2 pr-4">
                <SkeletonLine className="h-4 w-36" />
                <div className="flex items-center gap-3">
                  <SkeletonLine className="h-3 w-16" />
                  <SkeletonLine className="h-3 w-14" />
                </div>
              </div>
              <Skeleton className="h-8 w-16 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (connected === false) {
    return (
      <div className="border border-border rounded-xl bg-bg overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-text" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
          <h3 className="text-text font-semibold text-base mb-2">Connect your GitHub account</h3>
          <p className="text-muted text-sm mb-6 max-w-sm">
            Import repositories from GitHub to deploy automatically on every push.
          </p>
          <button
            type="button"
            disabled={connecting}
            onClick={() => {
              setConnecting(true);
              window.location.href = "/api/auth/link-github";
            }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-text text-bg rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {connecting ? (
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            {connecting ? "Redirecting to GitHub..." : "Connect GitHub"}
          </button>
          <p className="text-muted/60 text-xs mt-4">
            {connecting
              ? "You'll be redirected to GitHub to authorize access to your repositories."
              : "You'll be redirected to GitHub to authorize access to your repositories."}
          </p>
        </div>
      </div>
    );
  }

  const filtered = repos.filter(
    (r) =>
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="border border-border rounded-xl flex flex-col bg-bg">
      <div className="p-3 border-b border-border bg-surface/30 rounded-t-xl flex items-center gap-2">
        <svg className="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-sm w-full"
        />
      </div>
      <div className="sidebar-scroll max-h-[400px] overflow-y-auto">
        {filtered.map((repo) => (
          <div
            key={repo.id}
            className="flex items-center justify-between px-4 py-4 border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-text truncate">{repo.fullName}</span>
                {repo.private && (
                  <span className="text-[10px] px-1.5 py-0.5 border border-border rounded-full text-muted flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Private
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#3178c6]"></span>
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  2d ago
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelect(repo)}
              className="px-4 py-1.5 bg-bg border border-border text-text rounded-md text-sm font-medium hover:bg-surface transition-colors shrink-0"
            >
              Import
            </button>
          </div>
        ))}
        {filtered.length === 0 && repos.length > 0 && (
          <div className="p-6 text-sm text-muted text-center">
            No repositories match your search.
          </div>
        )}
      </div>
    </div>
  );
}
