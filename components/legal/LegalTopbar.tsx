"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

const titles: Record<string, string> = {
  "/legal": "Legal Dashboard",
  "/legal/cases": "Case Review",
  "/legal/evidence": "Evidence Review",
  "/legal/notes": "Legal Notes",
  "/legal/activity": "Legal Activity",
};

export default function LegalTopbar() {
  const pathname = usePathname();

  const title =
    titles[pathname] ||
    (pathname.startsWith("/legal/cases")
      ? "Case Details"
      : pathname.startsWith("/legal/evidence")
      ? "Evidence Details"
      : pathname.startsWith("/legal/notes")
      ? "Legal Notes"
      : "Legal Workspace");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-4 pl-20 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/80 md:px-8 lg:pl-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-purple-600 dark:text-purple-400">
            EVELOCK
          </p>

          <h2 className="truncate text-xl font-bold text-slate-950 dark:text-white md:text-2xl">
            {title}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors dark:border-white/10 dark:bg-white/10 dark:text-slate-200 md:block">
            📜 Legal Access
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}