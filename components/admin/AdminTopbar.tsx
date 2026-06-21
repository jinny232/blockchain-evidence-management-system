"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/users": "User Management",
  "/admin/cases": "Case Registry",
  "/admin/teams": "Team Assignment",
  "/admin/audit": "Audit Logs",
  "/admin/infrastructure": "Infrastructure",
};

export default function AdminTopbar() {
  const pathname = usePathname();

  const title =
    titles[pathname] ||
    (pathname.startsWith("/admin/users")
      ? "User Management"
      : pathname.startsWith("/admin/cases")
      ? "Case Registry"
      : pathname.startsWith("/admin/teams")
      ? "Team Assignment"
      : pathname.startsWith("/admin/audit")
      ? "Audit Logs"
      : pathname.startsWith("/admin/infrastructure")
      ? "Infrastructure"
      : "Admin Workspace");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-4 pl-20 backdrop-blur-xl md:px-8 lg:pl-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
          Blockchain Evidence System
        </p>

        <h2 className="text-xl font-bold text-slate-950 md:text-2xl">
          {title}
        </h2>
      </div>
    </header>
  );
}