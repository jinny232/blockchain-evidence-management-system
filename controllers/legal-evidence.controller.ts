import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  getLegalEvidence,
  getLegalEvidenceDetails,
} from "@/services/legal-evidence.service";

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

export async function handleGetLegalEvidence(request: NextRequest) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const evidence = await getLegalEvidence(auth.lawyerId);

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET LEGAL EVIDENCE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load legal evidence." },
      { status: 500 }
    );
  }
}

export async function handleGetLegalEvidenceDetails(
  request: NextRequest,
  evidenceId: string
) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericEvidenceId = Number(evidenceId);

    if (!Number.isFinite(numericEvidenceId)) {
      return NextResponse.json(
        { message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const evidence = await getLegalEvidenceDetails(
      auth.lawyerId,
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
    console.error("GET LEGAL EVIDENCE DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load evidence details." },
      { status: 500 }
    );
  }
}