import { type NextRequest } from "next/server";
import { handleGetLegalEvidence } from "@/controllers/legal-evidence.controller";

export async function GET(request: NextRequest) {
  return handleGetLegalEvidence(request);
}