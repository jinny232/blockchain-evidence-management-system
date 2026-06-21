"use client";

import { usePathname } from "next/navigation";

function getTitle(pathname: string) {
  if (pathname === "/investigator") return "Dashboard Overview";
  if (pathname.startsWith("/investigator/cases")) return "My Cases";
  if (pathname.startsWith("/investigator/evidence/submit")) {
    return "Submit Evidence";
  }
  if (pathname.startsWith("/investigator/evidence")) return "My Evidence";
  if (pathname.startsWith("/investigator/activity")) return "My Activity";

  return "Investigator Panel";
}

export default function InvestigatorTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-4 py-4 pl-20 lg:pl-8 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
            Investigator
          </p>
          <h2 className="text-xl font-bold text-slate-950">
            {getTitle(pathname)}
          </h2>
        </div>

        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm md:block">
          🔐 Role Protected
        </div>
      </div>
    </header>
  );
}