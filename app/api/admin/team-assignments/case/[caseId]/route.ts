import { handleUpdateCaseTeam } from "@/controllers/team-assignment.controller";

interface Params {
  params: Promise<{ caseId: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  const { caseId } = await params;

  return handleUpdateCaseTeam(request, caseId);
}