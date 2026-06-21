import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import CursorParticles from "@/components/ui/CursorParticles";
import TrustedAssistant from "@/components/assistant/TrustedAssistant";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <CursorParticles />

      <div className="relative z-10 flex min-h-screen">
        <AdminSidebar />

        <main className="min-h-screen flex-1 lg:pl-80">
          <AdminTopbar />

          <section className="px-5 py-8 sm:px-8">{children}</section>
        </main>
      </div>
      <TrustedAssistant />
    </div>
  );
}