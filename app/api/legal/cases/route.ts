import { type NextRequest } from "next/server";
import { handleGetLegalCases } from "@/controllers/legal-case.controller";

export async function GET(request: NextRequest) {
  return handleGetLegalCases(request);
}