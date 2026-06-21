import { loginController } from "@/controllers/auth.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return loginController(request);
}