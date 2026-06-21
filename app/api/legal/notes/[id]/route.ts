import { type NextRequest } from "next/server";
import {
  handleDeleteLegalNote,
  handleUpdateLegalNote,
} from "@/controllers/legal-note.controller";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleUpdateLegalNote(request, id);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;

  return handleDeleteLegalNote(request, id);
}