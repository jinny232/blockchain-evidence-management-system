import { type NextRequest } from "next/server";
import { handleSubmitLabResult } from "@/controllers/lab-evidence.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleSubmitLabResult(request, id);
}