import type { ReactNode } from "react";
import CursorParticles from "@/components/ui/CursorParticles";
import LegalSidebar from "@/components/legal/LegalSidebar";
import LegalTopbar from "@/components/legal/LegalTopbar";
import TrustedAssistant from "@/components/assistant/TrustedAssistant";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <CursorParticles />
      <LegalSidebar />

      <div className="lg:pl-80">
        <LegalTopbar />

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
      <TrustedAssistant />
    </div>
  );
}