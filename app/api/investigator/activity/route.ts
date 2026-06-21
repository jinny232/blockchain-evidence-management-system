import { type NextRequest } from "next/server";
import { handleGetInvestigatorActivity } from "@/controllers/investigator-activity.controller";

export async function GET(request: NextRequest) {
  return handleGetInvestigatorActivity(request);
}