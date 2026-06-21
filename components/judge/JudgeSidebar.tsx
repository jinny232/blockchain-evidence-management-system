"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/judge",
    label: "Dashboard",
    subtitle: "Overview",
    icon: "D",
  },
  {
    href: "/judge/cases",
    label: "Cases",
    subtitle: "Ready for decision",
    icon: "C",
  },
  {
    href: "/judge/evidence",
    label: "Evidence Review",
    subtitle: "Final review",
    icon: "E",
  },
  {
    href: "/judge/verdicts",
    label: "Verdicts",
    subtitle: "Final decisions",
    icon: "V",
  },
  {
    href: "/judge/activity",
    label: "Judge Activity",
    subtitle: "Action history",
    icon: "A",
  },
  {
  href: "/verify",
  label: "Verify Evidence",
  subtitle: "Hash integrity",
  icon: "V",
},
];

export default function JudgeSidebar() {
  return (
    <ResponsiveDashboardSidebar
      title="Judge Panel"
      subtitle="Final Case Decision"
      sectionLabel="Court"
      logo="J"
      accent="amber"
      navItems={navItems}
    />
  );
}