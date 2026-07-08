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
    <div className="border rounded-xl max-h-60 overflow-y-auto">
      {repos.map((repo) => (
        <button
          key={repo.id}
          type="button"
          onClick={() => onSelect(repo)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.05] border-b last:border-b-0 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{repo.fullName}</span>
              {repo.private && (
                <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.05] rounded uppercase font-medium">Private</span>
              )}
            </div>
            {repo.description && (
              <p className="text-xs text-muted truncate mt-0.5">{repo.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-[11px] text-muted">
              {repo.language && <span>{repo.language}</span>}
              <span>{repo.defaultBranch}</span>
            </div>
          </div>
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );
}
