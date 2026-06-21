import { type NextRequest } from "next/server";
import { handleGetLabEvidenceDetails } from "@/controllers/lab-evidence.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleGetLabEvidenceDetails(request, id);
}