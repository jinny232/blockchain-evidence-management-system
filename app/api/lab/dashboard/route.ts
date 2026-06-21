import { type NextRequest } from "next/server";
import { handleGetLabDashboard } from "@/controllers/lab-dashboard.controller";

export async function GET(request: NextRequest) {
  return handleGetLabDashboard(request);
}