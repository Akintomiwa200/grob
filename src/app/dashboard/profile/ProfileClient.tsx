"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  Mail,
  Shield,
  Key,
  Trash2,
  Camera,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

type ProfileData = {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  emailVerified: string | null;
  image: string | null;
  status: string;
  createdAt: string;
  accounts: { provider: string }[];
};

export default function ProfileClient({ profile }: { profile: ProfileData }) {
  const router = useRouter();

  const [name, setName] = useState(profile.name || "");
  const [username, setUsername] = useState(profile.username || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "error">("idle");
  const [deleteError, setDeleteError] = useState("");

  const githubConnected = profile.accounts.some((a) => a.provider === "github");
  const hasPassword = true;

  const initial = (profile.name || profile.email || "U").charAt(0).toUpperCase();

  async function handleSaveProfile() {
    setSaveStatus("saving");
    setSaveError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || null, username: username || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveStatus("error");
        setSaveError(data.error || "Failed to update");
        return;
      }
      setSaveStatus("saved");
      router.refresh();
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setSaveError("Network error");
    }
  }

  async function handleChangePassword() {
    setPasswordError("");
    if (!currentPassword || !newPassword) {
      setPasswordError("Both fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordStatus("loading");
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordStatus("error");
        setPasswordError(data.error || "Failed to update password");
        return;
      }
      setPasswordStatus("success");
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStatus("idle");
      }, 1500);
    } catch {
      setPasswordStatus("error");
      setPasswordError("Network error");
    }
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    if (deleteEmail !== profile.email) {
      setDeleteError("Email does not match your account");
      return;
    }
    setDeleteStatus("loading");
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: deleteEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteStatus("error");
        setDeleteError(data.error || "Failed to delete");
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleteStatus("error");
      setDeleteError("Network error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* Header / Cover */}
      <div className="relative mb-16 rounded-2xl bg-surface/30 border border-border overflow-hidden">
        <div className="h-32 w-full bg-gradient-to-r from-accent/20 via-blue-500/10 to-purple-500/20" />
        <div className="absolute -bottom-8 left-8 flex items-end gap-5">
          <div className="relative">
            {profile.image ? (
              <img src={profile.image} alt="" className="h-24 w-24 rounded-full border-4 border-bg object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-bg bg-gradient-to-br from-[#FF5FA2] to-[#6E5BFF] text-3xl font-bold text-white shadow-xl">
                {initial}
              </div>
            )}
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:bg-white/10 hover:text-text">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-text">{profile.name || "Grob User"}</h1>
            <p className="text-sm font-medium text-muted">@{username || profile.email?.split("@")[0] || "user"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar nav */}
        <div className="md:col-span-1 space-y-2">
          <nav className="flex flex-col gap-1">
            <a href="#general" className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-sm font-medium text-text transition-colors">
              <User className="h-4 w-4" /> General
            </a>
            <a href="#security" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-text">
              <Shield className="h-4 w-4" /> Security
            </a>
            <a href="#danger" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500/80 transition-colors hover:bg-red-500/10 hover:text-red-500">
              <Trash2 className="h-4 w-4" /> Danger Zone
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          {/* General Section */}
          <section id="general" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-text">General Information</h2>
              <p className="text-sm text-muted">Update your personal details and how others see you.</p>
            </div>
            <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-lg border border-border bg-[#0B0E14] px-3 py-2 text-sm text-text placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      placeholder="username"
                      className="w-full rounded-lg border border-border bg-[#0B0E14] px-3 py-2 text-sm text-text placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Email Address</label>
                  <div className="flex w-full items-center justify-between rounded-lg border border-border bg-[#0B0E14] px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-text">
                      <Mail className="h-4 w-4 text-muted" />
                      {profile.email || "No email provided"}
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-surface/30 px-5 py-3">
                <div className="flex items-center gap-2">
                  {saveStatus === "saved" && (
                    <span className="text-xs text-emerald-500">Saved</span>
                  )}
                  {saveStatus === "error" && (
                    <span className="text-xs text-red-500">{saveError}</span>
                  )}
                  {saveStatus === "idle" && (
                    <p className="text-xs text-muted">Please use a maximum of 32 characters.</p>
                  )}
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saveStatus === "saving"}
                  className="flex items-center gap-2 rounded-lg bg-text px-4 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {saveStatus === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section id="security" className="space-y-4 pt-4">
            <div>
              <h2 className="text-lg font-semibold text-text">Security & Authentication</h2>
              <p className="text-sm text-muted">Manage your connected accounts and security preferences.</p>
            </div>
            <div className="rounded-xl border border-border bg-surface/20">
              <div className="divide-y divide-border">
                {/* Password */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                      <Key className="h-5 w-5 text-muted" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-text">Password</p>
                      <p className="text-xs text-muted">
                        {hasPassword ? "Update your password." : "Set a permanent password to login to your account."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-white/5"
                  >
                    Update
                  </button>
                </div>

                {/* GitHub */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24292E]">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-text">GitHub Account</p>
                      <p className="text-xs text-muted">
                        {githubConnected ? "GitHub is connected to your account." : "Connect GitHub to login instantly."}
                      </p>
                    </div>
                  </div>
                  {githubConnected ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => { window.location.href = "/api/auth/link-github"; }}
                      className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-white/5"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section id="danger" className="space-y-4 pt-4">
            <div>
              <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
              <p className="text-sm text-muted">Irreversible and destructive actions.</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                <div className="space-y-1 max-w-sm">
                  <p className="font-medium text-sm text-text">Delete Account</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Permanently remove your Personal Account and all of its contents from the Grob platform. This action is not reversible.
                  </p>
                </div>
                <button
                  onClick={() => { setShowDeleteModal(true); setDeleteEmail(""); setDeleteError(""); setDeleteStatus("idle"); }}
                  className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white self-start md:self-auto shrink-0"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (passwordStatus !== "loading") setShowPasswordModal(false); }} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text">Update Password</h3>
              <button onClick={() => { if (passwordStatus !== "loading") setShowPasswordModal(false); }} className="text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            {passwordStatus === "success" ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="text-sm text-text font-medium">Password updated successfully</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-[#0B0E14] px-3 py-2 text-sm text-text placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-[#0B0E14] px-3 py-2 text-sm text-text placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                    className="w-full rounded-lg border border-border bg-[#0B0E14] px-3 py-2 text-sm text-text placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {passwordError && (
                  <p className="text-xs text-red-500">{passwordError}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordStatus === "loading"}
                    className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                  >
                    {passwordStatus === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (deleteStatus !== "loading") setShowDeleteModal(false); }} />
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/20 bg-bg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-red-500">Delete Account</h3>
              <button onClick={() => { if (deleteStatus !== "loading") setShowDeleteModal(false); }} className="text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted leading-relaxed">
                  This action is <span className="font-semibold text-red-500">irreversible</span>. All your projects, deployments, and data will be permanently deleted.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">
                  Type your email (<span className="text-text">{profile.email}</span>) to confirm:
                </label>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder={profile.email || ""}
                  className="w-full rounded-lg border border-red-500/20 bg-[#0B0E14] px-3 py-2 text-sm text-text placeholder-muted/50 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {deleteError && (
                <p className="text-xs text-red-500">{deleteError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteStatus === "loading" || deleteEmail !== profile.email}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {deleteStatus === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Delete my account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
