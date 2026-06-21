"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/legal",
    label: "Dashboard",
    subtitle: "Overview",
    icon: "D",
  },
  {
    href: "/legal/cases",
    label: "Case Review",
    subtitle: "Legal review",
    icon: "C",
  },
  {
    href: "/legal/evidence",
    label: "Evidence Review",
    subtitle: "Admissibility",
    icon: "E",
  },
  {
    href: "/legal/notes",
    label: "Legal Notes",
    subtitle: "Case arguments",
    icon: "N",
  },
  {
    href: "/legal/activity",
    label: "Legal Activity",
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

export default function LegalSidebar() {
  return (
    <ResponsiveDashboardSidebar
      title="Legal Review"
      subtitle="Evidence Admissibility"
      sectionLabel="Legal"
      logo="L"
      accent="purple"
      navItems={navItems}
    />
  );
}