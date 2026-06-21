import { type NextRequest } from "next/server";
import { handleGetLegalActivity } from "@/controllers/legal-activity.controller";

export async function GET(request: NextRequest) {
  return handleGetLegalActivity(request);
}