import LegalCaseDetailsClient from "@/components/legal/cases/LegalCaseDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LegalCaseDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <LegalCaseDetailsClient caseId={id} />;
}