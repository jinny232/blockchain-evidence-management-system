import { type NextRequest } from "next/server";
import { handleGetInvestigatorDashboard } from "@/controllers/investigator-dashboard.controller";

export async function GET(request: NextRequest) {
  return handleGetInvestigatorDashboard(request);
}