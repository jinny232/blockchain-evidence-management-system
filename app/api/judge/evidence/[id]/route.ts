import { type NextRequest } from "next/server";
import { handleGetJudgeEvidenceDetails } from "@/controllers/judge-evidence.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleGetJudgeEvidenceDetails(request, id);
}