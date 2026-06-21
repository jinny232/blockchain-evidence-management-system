import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getInvestigatorActivityLogs } from "@/services/investigator-activity.service";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

async function getInvestigatorIdFromRequest(request: NextRequest) {
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

  if (session.role !== "Investigator") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Investigator access only." },
        { status: 403 }
      ),
    };
  }

  const rawUserId = session.id ?? session.userId;
  const investigatorId = Number(rawUserId);

  if (!Number.isFinite(investigatorId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Invalid investigator session." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    investigatorId,
  };
}

export async function handleGetInvestigatorActivity(request: NextRequest) {
  try {
    const auth = await getInvestigatorIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const logs = await getInvestigatorActivityLogs(auth.investigatorId);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET INVESTIGATOR ACTIVITY ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load activity logs." },
      { status: 500 }
    );
  }
}