"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/judge",
    label: "Dashboard",
    subtitle: "Overview",
    icon: "📊",
  },
  {
    href: "/judge/cases",
    label: "Cases",
    subtitle: "Ready for decision",
    icon: "📁",
  },
  {
    href: "/judge/evidence",
    label: "Evidence Review",
    subtitle: "Final review",
    icon: "🧾",
  },
  {
    href: "/judge/verdicts",
    label: "Verdicts",
    subtitle: "Final decisions",
    icon: "⚖️",
  },
  {
    href: "/judge/activity",
    label: "Judge Activity",
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

export default function JudgeSidebar() {
  return (
    <ResponsiveDashboardSidebar
      title="Judge Panel"
      subtitle="Final Case Decision"
      sectionLabel="Court"
      logo="⚖️"
      accent="amber"
      navItems={navItems}
    />
  );
}