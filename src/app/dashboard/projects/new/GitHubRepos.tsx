"use client";

import { useEffect, useState } from "react";

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
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRepos(data);
        else setError(data.error || "Failed to load repos");
      })
      .catch(() => setError("Failed to load repos"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 border rounded-xl text-sm text-muted">
        Loading repositories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-xl text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="p-4 border-2 border-dashed rounded-xl text-sm text-muted text-center">
        No repositories found. Make sure GitHub OAuth is configured.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl flex flex-col bg-bg">
      <div className="p-3 border-b border-border bg-surface/30 rounded-t-xl flex items-center gap-2">
        <svg className="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
      </div>
      <div className="sidebar-scroll max-h-[400px] overflow-y-auto">
        {repos.map((repo) => (
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
      </div>
    </div>
  );
}
