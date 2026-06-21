import { handleGetEvidenceById } from "@/controllers/evidence.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  return handleGetEvidenceById(id);
}