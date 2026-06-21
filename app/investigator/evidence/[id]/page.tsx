import InvestigatorEvidenceDetailsClient from "@/components/investigator/evidence/InvestigatorEvidenceDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvestigatorEvidenceDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <InvestigatorEvidenceDetailsClient evidenceId={id} />;
}