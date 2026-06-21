"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/lab",
    label: "Dashboard",
    subtitle: "Overview",
    icon: "D",
  },
  {
    href: "/lab/evidence",
    label: "Evidence Queue",
    subtitle: "Pending & accepted",
    icon: "E",
  },
  {
    href: "/lab/reports",
    label: "Lab Reports",
    subtitle: "Analysis results",
    icon: "R",
  },
  {
    href: "/lab/activity",
    label: "Lab Activity",
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

export default function LabSidebar() {
  return (
    <ResponsiveDashboardSidebar
      title="Lab Technician"
      subtitle="Evidence Analysis System"
      sectionLabel="Laboratory"
      logo="L"
      accent="emerald"
      navItems={navItems}
    />
  );
}