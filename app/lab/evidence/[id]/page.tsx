import LabEvidenceDetailsClient from "@/components/lab/evidence/LabEvidenceDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LabEvidenceDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <LabEvidenceDetailsClient evidenceId={id} />;
}