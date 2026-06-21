import { type NextRequest } from "next/server";
import { handleGetJudgeActivity } from "@/controllers/judge-activity.controller";

export async function GET(request: NextRequest) {
  return handleGetJudgeActivity(request);
}