import { type NextRequest } from "next/server";
import { handleGetInvestigatorEvidenceDetails } from "@/controllers/investigator-evidence.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleGetInvestigatorEvidenceDetails(request, id);
}