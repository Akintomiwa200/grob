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
    <div className="flex min-h-screen bg-[#0B0E14]">
      <Sidebar
        user={{
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header — sidebar is desktop-only, so this stands in below md */}
        <header className="flex h-16 items-center gap-4 border-b border-[#212633] px-6 md:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold text-[#E7E9EE]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6E5BFF]">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            Grob
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-6 text-[#E7E9EE]">
          <Navbar />
          {children}
        </main>
      </div>
    </div>
  );
}
