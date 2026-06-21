import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  getJudgeEvidence,
  getJudgeEvidenceDetails,
} from "@/services/judge-evidence.service";

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

export async function handleGetJudgeEvidence(request: NextRequest) {
  try {
    const auth = await getJudgeIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const evidence = await getJudgeEvidence(auth.judgeId);

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET JUDGE EVIDENCE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load judge evidence." },
      { status: 500 }
    );
  }
}

export async function handleGetJudgeEvidenceDetails(
  request: NextRequest,
  evidenceId: string
) {
  try {
    const auth = await getJudgeIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericEvidenceId = Number(evidenceId);

    if (!Number.isFinite(numericEvidenceId)) {
      return NextResponse.json(
        { message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const evidence = await getJudgeEvidenceDetails(
      auth.judgeId,
      numericEvidenceId
    );

    if (!evidence) {
      return NextResponse.json(
        { message: "Evidence not found or not assigned to you." },
        { status: 404 }
      );
    }

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET JUDGE EVIDENCE DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load evidence details." },
      { status: 500 }
    );
  }
}