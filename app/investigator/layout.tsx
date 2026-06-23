import type { ReactNode } from "react";
import CursorParticles from "@/components/ui/CursorParticles";
import InvestigatorSidebar from "@/components/investigator/InvestigatorSidebar";
import InvestigatorTopbar from "@/components/investigator/InvestigatorTopbar";
import TrustedAssistant from "@/components/assistant/TrustedAssistant";

export default function InvestigatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <CursorParticles />

      <InvestigatorSidebar />

      <div className="relative z-10 min-h-screen lg:pl-72">
        <InvestigatorTopbar />

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>

      <TrustedAssistant />
    </div>
  );
}