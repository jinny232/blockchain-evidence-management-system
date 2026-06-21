import { type NextRequest } from "next/server";
import { handleAcceptLabEvidence } from "@/controllers/lab-evidence.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleAcceptLabEvidence(request, id);
}