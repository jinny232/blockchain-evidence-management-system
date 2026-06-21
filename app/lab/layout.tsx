import type { ReactNode } from "react";
import CursorParticles from "@/components/ui/CursorParticles";
import LabSidebar from "@/components/lab/LabSidebar";
import LabTopbar from "@/components/lab/LabTopbar";
import TrustedAssistant from "@/components/assistant/TrustedAssistant";

export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <CursorParticles />
      <LabSidebar />

      <div className="lg:pl-80">
        <LabTopbar />

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
      <TrustedAssistant />
    </div>
  );
}