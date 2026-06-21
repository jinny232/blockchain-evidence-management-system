import { type NextRequest } from "next/server";
import {
  handleCreateJudgeVerdict,
  handleGetJudgeVerdicts,
} from "@/controllers/judge-verdict.controller";

export async function GET(request: NextRequest) {
  return handleGetJudgeVerdicts(request);
}

export async function POST(request: NextRequest) {
  return handleCreateJudgeVerdict(request);
}