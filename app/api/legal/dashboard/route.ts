import { type NextRequest } from "next/server";
import { handleGetLegalDashboard } from "@/controllers/legal-dashboard.controller";

export async function GET(request: NextRequest) {
  return handleGetLegalDashboard(request);
}