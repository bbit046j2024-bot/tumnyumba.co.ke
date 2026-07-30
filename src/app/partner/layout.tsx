import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PartnerSidebar from "@/components/dashboard/PartnerSidebar";
import AdminTopbar from "@/components/dashboard/AdminTopbar";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "PARTNER" && session.user.role !== "ADMIN")) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
