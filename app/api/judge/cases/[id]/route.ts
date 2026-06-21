import { type NextRequest } from "next/server";
import { handleGetJudgeCaseDetails } from "@/controllers/judge-case.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleGetJudgeCaseDetails(request, id);
}