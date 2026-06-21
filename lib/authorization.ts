import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, type SessionPayload } from "@/lib/session";
import type { UserRole } from "@/models/user.model";

type AuthResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse };

export async function requireRole(
  request: NextRequest,
  requiredRole: UserRole
): Promise<AuthResult> {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  try {
    const session = await verifySessionToken(token);

    if (session.role !== requiredRole) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: "Forbidden." },
          { status: 403 }
        ),
      };
    }

    return { ok: true, session };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Invalid session." },
        { status: 401 }
      ),
    };
  }
}