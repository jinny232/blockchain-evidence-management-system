import { type NextRequest } from "next/server";
import {
  handleDeleteJudgeVerdict,
  handleUpdateJudgeVerdict,
} from "@/controllers/judge-verdict.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleUpdateJudgeVerdict(request, id);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleDeleteJudgeVerdict(request, id);
}