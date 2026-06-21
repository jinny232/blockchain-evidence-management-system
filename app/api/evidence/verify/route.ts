import { type NextRequest } from "next/server";
import { handleVerifyEvidenceHash } from "@/controllers/evidence-verification.controller";

export async function POST(request: NextRequest) {
  return handleVerifyEvidenceHash(request);
}