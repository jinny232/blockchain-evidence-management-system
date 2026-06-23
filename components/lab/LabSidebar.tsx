"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/lab",
    label: "Dashboard",
    subtitle: "Overview",
    icon: "📊",
  },
  {
    href: "/lab/evidence",
    label: "Evidence Queue",
    subtitle: "Pending & accepted",
    icon: "🧪",
  },
  {
    href: "/lab/reports",
    label: "Lab Reports",
    subtitle: "Analysis results",
    icon: "📋",
  },
  {
    href: "/lab/activity",
    label: "Lab Activity",
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

export default function LabSidebar() {
  return (
    <ResponsiveDashboardSidebar
      title="Lab Technician"
      subtitle="Evidence Analysis System"
      sectionLabel="Laboratory"
      logo="⚗️"
      accent="emerald"
      navItems={navItems}
    />
  );
}