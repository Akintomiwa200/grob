"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
            onClick={() => signIn("github")}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#24292E] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2F363D]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={() => signIn("google")}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => signIn("facebook")}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#1877F2] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#166FE5]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>
        </div>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted uppercase tracking-widest">Or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {step === "password" ? (
          <form 
            className="space-y-4" 
            onSubmit={async (e) => { 
              e.preventDefault(); 
              setError("");
              setIsLoading(true);

              if (mode === "register") {
                const res = await fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password })
                });
                
                if (!res.ok) {
                  const data = await res.json();
                  setError(data.error || "Failed to register");
                  setIsLoading(false);
                  return;
                }
              }

              const result = await signIn("credentials", {
                email,
                password,
                redirect: false
              });

              if (result?.error) {
                setError("Invalid email or password");
                setIsLoading(false);
              } else {
                window.location.href = "/dashboard";
              }
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <button 
                type="button" 
                onClick={() => { setStep("email"); setPassword(""); setError(""); }}
                className="p-1 rounded hover:bg-white/10 text-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-text">{email}</span>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted ml-1">
                {mode === "register" ? "Create a Password" : "Enter Password"}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full rounded-xl border border-border bg-[#0B0E14] px-4 py-3 text-sm text-text placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all shadow-sm"
              />
            </div>
            
            {error && <p className="text-xs text-red-500">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-text px-4 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? "Please wait..." : (mode === "register" ? "Create Account" : "Sign In")}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        ) : (
          <form 
            className="space-y-4" 
            onSubmit={async (e) => { 
              e.preventDefault(); 
              setError("");
              setIsLoading(true);
              
              const res = await fetch("/api/auth/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
              });
              
              if (res.ok) {
                const data = await res.json();
                setMode(data.exists ? "login" : "register");
                setStep("password");
              } else {
                setError("Something went wrong");
              }
              
              setIsLoading(false);
            }}
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                required
                className="w-full rounded-xl border border-border bg-[#0B0E14] px-4 py-3 text-sm text-text placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all shadow-sm"
              />
            </div>
            
            {error && <p className="text-xs text-red-500">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-text px-4 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? "Checking..." : "Continue with Email"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-muted">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
