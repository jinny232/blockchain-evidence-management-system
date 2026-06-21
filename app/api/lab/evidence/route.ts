import { type NextRequest } from "next/server";
import { handleGetLabEvidenceQueue } from "@/controllers/lab-evidence.controller";

export async function GET(request: NextRequest) {
  return handleGetLabEvidenceQueue(request);
}