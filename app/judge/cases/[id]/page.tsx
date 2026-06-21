import JudgeCaseDetailsClient from "@/components/judge/cases/JudgeCaseDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JudgeCaseDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <JudgeCaseDetailsClient caseId={id} />;
}