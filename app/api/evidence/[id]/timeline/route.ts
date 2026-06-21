import { type NextRequest } from "next/server";
import { handleGetEvidenceTimeline } from "@/controllers/evidence-timeline.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleGetEvidenceTimeline(request, id);
}