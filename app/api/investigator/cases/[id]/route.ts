import { type NextRequest } from "next/server";
import { handleGetInvestigatorCaseDetails } from "@/controllers/investigator-case.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleGetInvestigatorCaseDetails(request, id);
}