import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  Trash2,
  Mail,
  Info,
} from "lucide-react";
import { addCollaborator, removeCollaborator } from "./actions";

function Avatar({ name, image, size = "md" }: { name: string | null; image?: string | null; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  if (image) {
    return <img src={image} alt="" className={`${sizeClass} rounded-full object-cover`} />;
  }
  const initials = (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeClass} rounded-full bg-accent/10 text-accent font-medium flex items-center justify-center`}>
      {initials}
    </div>
  );
}

const ROLE_CONFIG: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  owner: { icon: Crown, color: "text-yellow-500 bg-yellow-500/10", label: "Owner" },
  admin: { icon: Shield, color: "text-blue-500 bg-blue-500/10", label: "Admin" },
  member: { icon: Users, color: "text-muted bg-muted/10", label: "Member" },
  viewer: { icon: Users, color: "text-muted bg-muted/10", label: "Viewer" },
};

export default async function CollaboratorsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      members: { include: { user: true } },
      user: true,
    },
  });
  if (!project) notFound();

  const allMembers = [
    { id: "owner", user: project.user, role: "owner", isOwner: true },
    ...project.members.map((m) => ({ ...m, isOwner: false })),
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Collaborators</h2>
        <p className="text-muted text-sm">
          Manage team members for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Invite form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-3">Invite Member</h3>
        <form
          action={addCollaborator.bind(null, project.id)}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              name="email"
              type="email"
              required
              placeholder="colleague@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        </form>
        <p className="text-xs text-muted mt-2">
          The user must already have a Grob account. They&apos;ll gain access immediately after being added.
        </p>
      </div>

      {/* Members list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text">
            Members
            <span className="text-muted font-normal ml-2">
              ({allMembers.length})
            </span>
          </h3>
        </div>

        <div className="space-y-2">
          {allMembers.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;
            const RoleIcon = roleConfig.icon;
            const displayName = member.isOwner
              ? project.user.name || "You"
              : member.user.name || "Member";
            const displayEmail = member.isOwner
              ? project.user.email
              : member.user.email;

            return (
              <div
                key={member.id}
                className="bg-surface border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar name={displayName} image={member.isOwner ? project.user.image : member.user.image} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text truncate">
                        {displayName}
                      </span>
                      {member.isOwner && (
                        <span className="text-[10px] text-muted">(you)</span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">{displayEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg ${roleConfig.color}`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {roleConfig.label}
                  </span>
                  {!member.isOwner && (
                    <form action={removeCollaborator.bind(null, project.id, member.id)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted space-y-1">
          <p>
            <strong className="text-text">Owner</strong> — Full access including billing, settings, and team management.
          </p>
          <p>
            <strong className="text-text">Member</strong> — Can deploy, configure projects, and view logs.
          </p>
          <p>
            <strong className="text-text">Viewer</strong> — Read-only access to dashboards and deployments.
          </p>
        </div>
      </div>
    </div>
  );
}
