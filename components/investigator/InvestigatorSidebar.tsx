"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/investigator",
    label: "Dashboard",
    subtitle: "Overview",
    icon: "📊",
  },
  {
    href: "/investigator/cases",
    label: "My Cases",
    subtitle: "Assigned cases",
    icon: "📁",
  },
  {
    href: "/investigator/evidence/submit",
    label: "Submit Evidence",
    subtitle: "Upload & record",
    icon: "📤",
  },
  {
    href: "/investigator/evidence",
    label: "My Evidence",
    subtitle: "Submitted files",
    icon: "🧾",
  },
  {
    href: "/investigator/activity",
    label: "My Activity",
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

export default function InvestigatorSidebar() {
  return (
    <ResponsiveDashboardSidebar
      title="Investigator"
      subtitle="Evidence Submission"
      sectionLabel="Investigation"
      logo="🔍"
      accent="blue"
      navItems={navItems}
    />
  );
}