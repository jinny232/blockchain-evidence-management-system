import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { askTrustedAssistant } from "@/services/trusted-assistant.service";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

const allowedRoles = [
  "Admin",
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
] as const;

type AllowedRole = (typeof allowedRoles)[number];

function isAllowedRole(role: string | undefined): role is AllowedRole {
  return Boolean(role && allowedRoles.includes(role as AllowedRole));
}

async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Unauthorized. Please login again." },
        { status: 401 }
      ),
    };
  }

  const session = (await verifySessionToken(token)) as SessionLike;

  if (!isAllowedRole(session.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Invalid role." },
        { status: 403 }
      ),
    };
  }

  const rawUserId = session.id ?? session.userId;
  const userId = Number(rawUserId);

  if (!Number.isFinite(userId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Invalid user session." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    userId,
    role: session.role,
  };
}

export async function handleTrustedAssistant(request: NextRequest) {
  try {
    const auth = await getSessionFromRequest(request);

    if (!auth.ok) return auth.response;

    const body = await request.json();

    const question =
      typeof body.question === "string" && body.question.trim()
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        { message: "Question is required." },
        { status: 400 }
      );
    }

    if (question.length > 300) {
      return NextResponse.json(
        { message: "Question is too long. Please keep it under 300 characters." },
        { status: 400 }
      );
    }

    const result = await askTrustedAssistant(question, {
      userId: auth.userId,
      role: auth.role,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("TRUSTED ASSISTANT ERROR:", error);

    return NextResponse.json(
      { message: "Trusted Assistant failed to process your question." },
      { status: 500 }
    );
  }
}