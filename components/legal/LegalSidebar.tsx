"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/legal",
    label: "Dashboard",
    subtitle: "Overview",
    icon: "📊",
  },
  {
    href: "/legal/cases",
    label: "Case Review",
    subtitle: "Legal review",
    icon: "📁",
  },
  {
    href: "/legal/evidence",
    label: "Evidence Review",
    subtitle: "Admissibility",
    icon: "🧾",
  },
  {
    href: "/legal/notes",
    label: "Legal Notes",
    subtitle: "Case arguments",
    icon: "📝",
  },
  {
    href: "/legal/activity",
    label: "Legal Activity",
    subtitle: "Action history",
    icon: "🕒",
  },
  {
    href: "/verify",
    label: "Verify Evidence",
    subtitle: "Hash integrity",
    icon: "🛡️",
  },
];

export default function LegalSidebar() {
  return (
<ResponsiveDashboardSidebar
  title="Legal Panel"
  subtitle="Evidence Review Unit"
  sectionLabel="Legal Review"
  logo="📜"
  accent="purple"
  navItems={navItems}
/>
  );
}