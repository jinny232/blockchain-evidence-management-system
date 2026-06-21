import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getLegalActivityLogs } from "@/services/legal-activity.service";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

async function getLawyerIdFromRequest(request: NextRequest) {
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

  if (session.role !== "Lawyer") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Lawyer access only." },
        { status: 403 }
      ),
    };
  }

  const rawUserId = session.id ?? session.userId;
  const lawyerId = Number(rawUserId);

  if (!Number.isFinite(lawyerId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Invalid lawyer session." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    lawyerId,
  };
}

export async function handleGetLegalActivity(request: NextRequest) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const logs = await getLegalActivityLogs(auth.lawyerId);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET LEGAL ACTIVITY ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load legal activity logs." },
      { status: 500 }
    );
  }
}