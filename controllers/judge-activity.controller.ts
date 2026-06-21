import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getJudgeActivityLogs } from "@/services/judge-activity.service";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

async function getJudgeIdFromRequest(request: NextRequest) {
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

  if (session.role !== "Judge") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Judge access only." },
        { status: 403 }
      ),
    };
  }

  const rawUserId = session.id ?? session.userId;
  const judgeId = Number(rawUserId);

  if (!Number.isFinite(judgeId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Invalid judge session." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    judgeId,
  };
}

export async function handleGetJudgeActivity(request: NextRequest) {
  try {
    const auth = await getJudgeIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const logs = await getJudgeActivityLogs(auth.judgeId);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET JUDGE ACTIVITY ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load judge activity logs." },
      { status: 500 }
    );
  }
}