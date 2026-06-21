import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  getJudgeCaseDetails,
  getJudgeCases,
} from "@/services/judge-case.service";

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

export async function handleGetJudgeCases(request: NextRequest) {
  try {
    const auth = await getJudgeIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const cases = await getJudgeCases(auth.judgeId);

    return NextResponse.json(cases);
  } catch (error) {
    console.error("GET JUDGE CASES ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load judge cases." },
      { status: 500 }
    );
  }
}

export async function handleGetJudgeCaseDetails(
  request: NextRequest,
  caseId: string
) {
  try {
    const auth = await getJudgeIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericCaseId = Number(caseId);

    if (!Number.isFinite(numericCaseId)) {
      return NextResponse.json(
        { message: "Invalid case ID." },
        { status: 400 }
      );
    }

    const judgeCase = await getJudgeCaseDetails(auth.judgeId, numericCaseId);

    if (!judgeCase) {
      return NextResponse.json(
        { message: "Case not found or not assigned to you." },
        { status: 404 }
      );
    }

    return NextResponse.json(judgeCase);
  } catch (error) {
    console.error("GET JUDGE CASE DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load judge case details." },
      { status: 500 }
    );
  }
}