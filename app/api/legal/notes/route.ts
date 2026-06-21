import { type NextRequest } from "next/server";
import {
  handleCreateLegalNote,
  handleGetLegalNotes,
} from "@/controllers/legal-note.controller";

export async function GET(request: NextRequest) {
  return handleGetLegalNotes(request);
}

export async function POST(request: NextRequest) {
  return handleCreateLegalNote(request);
}