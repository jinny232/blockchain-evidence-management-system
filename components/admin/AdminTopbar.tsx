"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

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
  <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-4 pl-20 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/80 md:px-8 lg:pl-8">
    <div className="flex w-full items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
          EVELOCK
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white md:text-2xl">
          {title}
        </h2>
      </div>

      <div className="flex shrink-0 items-center">
        <ThemeToggle />
      </div>
    </div>
  </header>
);
}