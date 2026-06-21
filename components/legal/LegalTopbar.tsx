"use client";

import { usePathname } from "next/navigation";

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
      : "Legal Workspace");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-4 pl-20 lg:pl-8 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-600">
          Blockchain Evidence Management
        </p>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      </div>
    </header>
  );
}