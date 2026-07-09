"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Lock, Fingerprint, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s?.user) window.location.href = "/dashboard";
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="mx-auto w-full max-w-sm px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
            <span className="text-xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Log in to Grob</h1>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#24292E] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2F363D]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={() => signIn("gitlab", { callbackUrl: "/dashboard" })}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#6E49CE] to-[#FC6D26] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 00-.867 0L1.386 9.452.044 13.587a.924.924 0 00.331 1.024L12 23.054l11.625-8.443a.92.92 0 00.33-1.024" />
            </svg>
            Continue with GitLab
          </button>

          <button
            onClick={() => signIn("bitbucket", { callbackUrl: "/dashboard" })}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#0052CC] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0747A6]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0.778 1.213a0.768 0.768 0 00-0.768 0.892l3.263 19.81c0.084 0.5 0.512 0.868 1.02 0.873h15.19c0.4-0.006 0.732-0.294 0.782-0.687L23.99 2.11a0.768 0.768 0 00-0.768-0.897H0.778zM14.52 15.53h-5.05L8.155 8.5h7.667l-1.302 7.03z" />
            </svg>
            Continue with Bitbucket
          </button>
        </div>

        <div className="my-6 h-px bg-border" />

        <div className="space-y-3">
          <button
            onClick={() => signIn("saml", { callbackUrl: "/dashboard" })}
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-border px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-white/[0.05]"
          >
            <Lock className="h-4 w-4" strokeWidth={1.75} />
            Continue with SAML SSO
          </button>

          <button
            onClick={() => signIn("passkey", { callbackUrl: "/dashboard" })}
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-border px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-white/[0.05]"
          >
            <Fingerprint className="h-4 w-4" strokeWidth={1.75} />
            Login with Passkey
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => signIn("email", { callbackUrl: "/dashboard" })}
            className="inline-flex cursor-pointer items-center gap-1 text-sm text-accent hover:underline"
          >
            Continue with Email
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
