import type { NextRequest } from "next/server";
import {
  deleteUserController,
  updateUserController,
} from "@/controllers/user.controller";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return updateUserController(request, Number(id));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return deleteUserController(request, Number(id));
}