import {
  handleCreateCase,
  handleGetCases,
} from "@/controllers/case.controller";

export async function GET() {
  return handleGetCases();
}

export async function POST(request: Request) {
  return handleCreateCase(request);
}