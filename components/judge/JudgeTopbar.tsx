"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/judge": "Judge Dashboard",
  "/judge/cases": "Case Review",
  "/judge/evidence": "Evidence Review",
  "/judge/verdicts": "Verdicts",
  "/judge/activity": "Judge Activity",
};

export default function JudgeTopbar() {
  const pathname = usePathname();

  const title =
    titles[pathname] ||
    (pathname.startsWith("/judge/cases")
      ? "Case Details"
      : pathname.startsWith("/judge/evidence")
      ? "Evidence Details"
      : pathname.startsWith("/judge/verdicts")
      ? "Verdict Details"
      : "Judge Workspace");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-4 pl-20 lg:pl-8 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-600">
          Blockchain Evidence Management
        </p>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      </div>
    </header>
  );
}