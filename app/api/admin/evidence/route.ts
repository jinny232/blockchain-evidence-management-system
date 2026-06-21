import { handleGetEvidenceRecords } from "@/controllers/evidence.controller";

export async function GET() {
  return handleGetEvidenceRecords();
}