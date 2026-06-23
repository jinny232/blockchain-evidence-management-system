"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type DashboardAccent =
  | "blue"
  | "emerald"
  | "purple"
  | "amber"
  | "rose";

export interface DashboardNavItem {
  href: string;
  label: string;
  subtitle: string;
  icon: string;
}

interface ResponsiveDashboardSidebarProps {
  title: string;
  subtitle: string;
  sectionLabel: string;
  logo: string;
  accent?: DashboardAccent;
  navItems: DashboardNavItem[];
}

const accentClasses: Record<
  DashboardAccent,
  {
    logo: string;
    active: string;
    activeGlow: string;
    icon: string;
    iconActive: string;
    subtitle: string;
    mobileButton: string;
  }
> = {
  blue: {
    logo: "bg-blue-600 text-white shadow-blue-900/40",
    active: "bg-blue-600 text-white shadow-lg shadow-blue-950/40",
    activeGlow: "bg-blue-300",
    icon: "bg-slate-100 text-blue-600 group-hover:bg-slate-200 dark:bg-white/10 dark:text-blue-200 dark:group-hover:bg-white/15",
    iconActive: "bg-white/15 text-white",
    subtitle: "text-blue-600 dark:text-blue-200",
    mobileButton: "bg-blue-600 shadow-blue-200 hover:bg-blue-700",
  },
  emerald: {
    logo: "bg-emerald-600 text-white shadow-emerald-900/40",
    active: "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40",
    activeGlow: "bg-emerald-300",
    icon: "bg-slate-100 text-emerald-600 group-hover:bg-slate-200 dark:bg-white/10 dark:text-emerald-200 dark:group-hover:bg-white/15",
    iconActive: "bg-white/15 text-white",
    subtitle: "text-emerald-600 dark:text-emerald-200",
    mobileButton: "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700",
  },
  purple: {
    logo: "bg-purple-600 text-white shadow-purple-900/40",
    active: "bg-purple-600 text-white shadow-lg shadow-purple-950/40",
    activeGlow: "bg-purple-300",
    icon: "bg-slate-100 text-purple-600 group-hover:bg-slate-200 dark:bg-white/10 dark:text-purple-200 dark:group-hover:bg-white/15",
    iconActive: "bg-white/15 text-white",
    subtitle: "text-purple-600 dark:text-purple-200",
    mobileButton: "bg-purple-600 shadow-purple-200 hover:bg-purple-700",
  },
  amber: {
    logo: "bg-yellow-600 text-white shadow-yellow-900/40",
    active: "bg-amber-500 text-white shadow-lg shadow-amber-950/40",
    activeGlow: "bg-amber-200",
    icon: "bg-slate-100 text-amber-600 group-hover:bg-slate-200 dark:bg-white/10 dark:text-amber-200 dark:group-hover:bg-white/15",
    iconActive: "bg-white/15 text-white",
    subtitle: "text-amber-600 dark:text-amber-200",
    mobileButton: "bg-amber-500 shadow-amber-200 hover:bg-amber-600",
  },
  rose: {
    logo: "bg-rose-600 text-white shadow-rose-900/40",
    active: "bg-rose-600 text-white shadow-lg shadow-rose-950/40",
    activeGlow: "bg-rose-300",
    icon: "bg-slate-100 text-rose-600 group-hover:bg-slate-200 dark:bg-white/10 dark:text-rose-200 dark:group-hover:bg-white/15",
    iconActive: "bg-white/15 text-white",
    subtitle: "text-rose-600 dark:text-rose-200",
    mobileButton: "bg-rose-600 shadow-rose-200 hover:bg-rose-700",
  },
};

export default function ResponsiveDashboardSidebar({
  title,
  subtitle,
  sectionLabel,
  logo,
  accent = "blue",
  navItems,
}: ResponsiveDashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const theme = accentClasses[accent];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/investigator") return pathname === "/investigator";
    if (href === "/lab") return pathname === "/lab";
    if (href === "/legal") return pathname === "/legal";
    if (href === "/judge") return pathname === "/judge";

      if (href === "/investigator/evidence") {
    return pathname === "/investigator/evidence";
  }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  function SidebarContent({ mobile = false }: { mobile?: boolean }) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-6 transition-colors dark:border-white/10">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-lg ${theme.logo}`}
          >
            {logo}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-slate-950 dark:text-white">
              {title}
            </h1>
            <p className={`truncate text-sm ${theme.subtitle}`}>{subtitle}</p>
          </div>

          {mobile && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar-scroll flex-1 space-y-2 overflow-y-auto px-5 py-7">
          <p className="mb-5 px-2 text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
            {sectionLabel}
          </p>

          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group relative flex items-center gap-4 rounded-2xl px-4 py-4 transition duration-200 ${
                  active
                    ? theme.active
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {active && (
                  <span
                    className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full ${theme.activeGlow}`}
                  />
                )}

                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-black ${
                    active ? theme.iconActive : theme.icon
                  }`}
                >
                  {item.icon}
                </span>

                <span className="min-w-0">
                  <span className="block truncate font-bold">
                    {item.label}
                  </span>
                  <span
                    className={`block truncate text-sm ${
                      active ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-5 transition-colors dark:border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-red-500/40 dark:hover:bg-red-950/40 dark:hover:text-red-100"
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>

        <style jsx>{`
          .sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
          }

          .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.3);
            border-radius: 999px;
          }

          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.5);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg lg:hidden ${theme.mobileButton}`}
        aria-label="Open menu"
      >
        ☰
      </button>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white text-slate-950 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-950 dark:text-white lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="Close menu overlay"
          />

          <aside className="relative z-10 h-full w-72 max-w-[86vw] border-r border-slate-200 bg-white text-slate-950 shadow-2xl transition-colors dark:border-white/10 dark:bg-slate-950 dark:text-white">
            <SidebarContent mobile />
          </aside>
        </div>
      )}
    </>
  );
}