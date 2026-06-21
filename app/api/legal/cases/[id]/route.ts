import { type NextRequest } from "next/server";
import { handleGetLegalCaseDetails } from "@/controllers/legal-case.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleGetLegalCaseDetails(request, id);
}