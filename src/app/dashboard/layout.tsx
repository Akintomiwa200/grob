import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar
        user={{
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header — sidebar is desktop-only, so this stands in below md */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-6 md:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold text-text"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            Grob
          </Link>
        </header>

        <Navbar
          userName={session.user?.name}
          userImage={session.user?.image}
        />

        <main className="flex-1 overflow-y-auto p-6 text-text">
          {children}
        </main>
      </div>
    </div>
  );
}
