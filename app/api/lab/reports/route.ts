import { type NextRequest } from "next/server";
import { handleGetLabReports } from "@/controllers/lab-report.controller";

export async function GET(request: NextRequest) {
  return handleGetLabReports(request);
}