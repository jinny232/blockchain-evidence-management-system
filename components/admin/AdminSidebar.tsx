"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    subtitle: "System overview",
    icon: "📊",
  },
  {
    href: "/admin/users",
    label: "Users",
    subtitle: "RBAC accounts",
    icon: "👥",
  },
  {
    href: "/admin/cases",
    label: "Cases",
    subtitle: "Case registry",
    icon: "📁",
  },
  {
    href: "/admin/teams",
    label: "Teams",
    subtitle: "Case assignment",
    icon: "T",
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    subtitle: "System history",
    icon: "🧑‍💼",
  },
  {
    href: "/admin/infrastructure",
    label: "Infrastructure",
    subtitle: "Blockchain status",
    icon: "🧾",
  },
];

export default function AdminSidebar() {
  return (
    <ResponsiveDashboardSidebar
      title="Admin Panel"
      subtitle="Evidence Control Center"
      sectionLabel="Administration"
      logo="A"
      accent="blue"
      navItems={navItems}
    />
  );
}