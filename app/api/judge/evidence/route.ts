import { type NextRequest } from "next/server";
import { handleGetJudgeEvidence } from "@/controllers/judge-evidence.controller";

export async function GET(request: NextRequest) {
  return handleGetJudgeEvidence(request);
}