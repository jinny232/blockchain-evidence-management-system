import { type NextRequest } from "next/server";
import {
  handleGetInvestigatorEvidence,
  handleSubmitInvestigatorEvidence,
} from "@/controllers/investigator-evidence.controller";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleGetInvestigatorEvidence(request);
}

export async function POST(request: NextRequest) {
  return handleSubmitInvestigatorEvidence(request);
}