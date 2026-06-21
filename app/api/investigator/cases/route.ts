import { type NextRequest } from "next/server";
import { handleGetInvestigatorCases } from "@/controllers/investigator-case.controller";

export async function GET(request: NextRequest) {
  return handleGetInvestigatorCases(request);
}