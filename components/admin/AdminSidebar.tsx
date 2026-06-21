"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    subtitle: "System overview",
    icon: "D",
  },
  {
    href: "/admin/users",
    label: "Users",
    subtitle: "RBAC accounts",
    icon: "U",
  },
  {
    href: "/admin/cases",
    label: "Cases",
    subtitle: "Case registry",
    icon: "C",
  },
  {
    href: "/admin/teams",
    label: "Teams",
    subtitle: "Case assignment",
    icon: "T",
  },
  {
    href: "/admin/audit",
    label: "Audit Logs",
    subtitle: "System history",
    icon: "A",
  },
  {
    href: "/admin/infrastructure",
    label: "Infrastructure",
    subtitle: "Blockchain status",
    icon: "I",
  },
  {
  href: "/verify",
  label: "Verify Evidence",
  subtitle: "Hash integrity",
  icon: "V",
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