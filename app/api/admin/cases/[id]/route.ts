import {
  handleDeleteCase,
  handleUpdateCase,
} from "@/controllers/case.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return handleUpdateCase(request, id);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return handleDeleteCase(id);
}