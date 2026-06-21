import type { NextRequest } from "next/server";
import {
  createUserController,
  getUsersController,
} from "@/controllers/user.controller";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return getUsersController(request);
}

export async function POST(request: NextRequest) {
  return createUserController(request);
}