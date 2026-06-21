import { type NextRequest } from "next/server";
import { handleGetLabActivity } from "@/controllers/lab-activity.controller";

export async function GET(request: NextRequest) {
  return handleGetLabActivity(request);
}