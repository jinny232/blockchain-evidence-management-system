import { type NextRequest } from "next/server";
import { handleGetJudgeCases } from "@/controllers/judge-case.controller";

export async function GET(request: NextRequest) {
  return handleGetJudgeCases(request);
}