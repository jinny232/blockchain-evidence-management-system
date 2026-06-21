import { type NextRequest } from "next/server";
import { handleTrustedAssistant } from "@/controllers/trusted-assistant.controller";

export async function POST(request: NextRequest) {
  return handleTrustedAssistant(request);
}