import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Manage your account settings.</p>

      <div className="space-y-6">
        <div className="p-5 border rounded-xl">
          <h2 className="font-semibold mb-1">Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your name and email are managed through GitHub.</p>
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <img src={session.user.image} alt="" className="w-12 h-12 rounded-full" />
            )}
            <div>
              <p className="font-medium">{session.user?.name || "User"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
