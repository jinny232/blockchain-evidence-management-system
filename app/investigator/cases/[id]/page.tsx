import InvestigatorCaseDetailsClient from "@/components/investigator/cases/InvestigatorCaseDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvestigatorCaseDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <InvestigatorCaseDetailsClient caseId={id} />;
}