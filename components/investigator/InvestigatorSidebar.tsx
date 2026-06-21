"use client";

import ResponsiveDashboardSidebar, {
  type DashboardNavItem,
} from "@/components/ui/ResponsiveDashboardSidebar";

const navItems: DashboardNavItem[] = [
  {
    href: "/investigator",
    label: "Dashboard",
    subtitle: "Overview",
    icon: "D",
  },
  {
    href: "/investigator/cases",
    label: "My Cases",
    subtitle: "Assigned cases",
    icon: "C",
  },
  {
    href: "/investigator/evidence/submit",
    label: "Submit Evidence",
    subtitle: "Upload & record",
    icon: "S",
  },
  {
    href: "/investigator/evidence",
    label: "My Evidence",
    subtitle: "Submitted files",
    icon: "E",
  },
  {
    href: "/investigator/activity",
    label: "My Activity",
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

export default function InvestigatorSidebar() {
  return (
    <ResponsiveDashboardSidebar
      title="Investigator"
      subtitle="Evidence Submission"
      sectionLabel="Investigation"
      logo="I"
      accent="blue"
      navItems={navItems}
    />
  );
}