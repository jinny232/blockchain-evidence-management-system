"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

const titles: Record<string, string> = {
  "/lab": "Lab Dashboard",
  "/lab/evidence": "Evidence Queue",
  "/lab/reports": "Lab Reports",
  "/lab/activity": "Lab Activity",
};

export default function LabTopbar() {
  const pathname = usePathname();

  const title =
    titles[pathname] ||
    (pathname.startsWith("/lab/evidence")
      ? "Evidence Details"
      : pathname.startsWith("/lab/reports")
      ? "Lab Report Details"
      : "Lab Workspace");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-4 pl-20 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/80 md:px-8 lg:pl-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400">
           EVELOCK
          </p>

          <h2 className="truncate text-xl font-bold text-slate-950 dark:text-white md:text-2xl">
            {title}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors dark:border-white/10 dark:bg-white/10 dark:text-slate-200 md:block">
            🧪 Lab Access
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}