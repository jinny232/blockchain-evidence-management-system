import { type NextRequest } from "next/server";
import { handleDownloadJudgeVerdictPdf } from "@/controllers/judge-verdict-pdf.controller";

export const runtime = "nodejs";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleDownloadJudgeVerdictPdf(request, id);
}