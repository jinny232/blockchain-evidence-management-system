import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getLegalDashboardData } from "@/services/legal-dashboard.service";

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

export async function handleGetLegalDashboard(request: NextRequest) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const data = await getLegalDashboardData(auth.lawyerId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET LEGAL DASHBOARD ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load legal dashboard." },
      { status: 500 }
    );
  }
}