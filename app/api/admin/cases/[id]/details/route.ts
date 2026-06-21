import { handleGetCaseDetails } from "@/controllers/case-detail.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  return handleGetCaseDetails(id);
}