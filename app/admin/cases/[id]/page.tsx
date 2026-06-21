import CaseDetailsClient from "@/components/admin/cases/CaseDetailsClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCaseDetailsPage({ params }: Props) {
  const { id } = await params;

  return <CaseDetailsClient caseId={id} />;
}