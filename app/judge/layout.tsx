import type { ReactNode } from "react";
import CursorParticles from "@/components/ui/CursorParticles";
import JudgeSidebar from "@/components/judge/JudgeSidebar";
import JudgeTopbar from "@/components/judge/JudgeTopbar";
import TrustedAssistant from "@/components/assistant/TrustedAssistant";

export default function JudgeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <CursorParticles />
      <JudgeSidebar />

      <div className="relative z-10 min-h-screen lg:pl-72">
        <JudgeTopbar />

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          {children}
        </main>
      </div>

      <TrustedAssistant />
    </div>
  );
}