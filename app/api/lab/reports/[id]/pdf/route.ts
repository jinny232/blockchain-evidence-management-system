import { type NextRequest } from "next/server";
import { handleDownloadLabReportPdf } from "@/controllers/lab-report-pdf.controller";

export const runtime = "nodejs";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleDownloadLabReportPdf(request, id);
}