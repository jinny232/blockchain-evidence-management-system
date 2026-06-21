import { type NextRequest } from "next/server";
import { handleGetJudgeDashboard } from "@/controllers/judge-dashboard.controller";

export async function GET(request: NextRequest) {
  return handleGetJudgeDashboard(request);
}