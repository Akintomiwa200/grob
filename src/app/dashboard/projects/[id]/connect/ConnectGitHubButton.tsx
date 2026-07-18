"use client";

import { useState } from "react";

export function ConnectGitHubButton() {
  const [connecting, setConnecting] = useState(false);

  return (
    <button
      disabled={connecting}
      onClick={() => {
        setConnecting(true);
        window.location.href = "/api/auth/link-github";
      }}
      className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
    >
      {connecting && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {connecting ? "Redirecting..." : "Connect GitHub"}
    </button>
  );
}
