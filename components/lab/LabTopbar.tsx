"use client";

import { usePathname } from "next/navigation";

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
      : "Lab Workspace");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-4 pl-20 backdrop-blur-xl md:px-8 lg:pl-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-600">
          Blockchain Evidence Management
        </p>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      </div>
    </header>
  );
}