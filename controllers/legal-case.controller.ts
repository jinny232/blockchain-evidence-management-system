import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  getLegalCaseDetails,
  getLegalCases,
} from "@/services/legal-case.service";

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

export async function handleGetLegalCases(request: NextRequest) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const cases = await getLegalCases(auth.lawyerId);

    return NextResponse.json(cases);
  } catch (error) {
    console.error("GET LEGAL CASES ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load legal cases." },
      { status: 500 }
    );
  }
}

export async function handleGetLegalCaseDetails(
  request: NextRequest,
  caseId: string
) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericCaseId = Number(caseId);

    if (!Number.isFinite(numericCaseId)) {
      return NextResponse.json(
        { message: "Invalid case ID." },
        { status: 400 }
      );
    }

    const legalCase = await getLegalCaseDetails(
      auth.lawyerId,
      numericCaseId
    );

    if (!legalCase) {
      return NextResponse.json(
        { message: "Case not found or not assigned to you." },
        { status: 404 }
      );
    }

    return NextResponse.json(legalCase);
  } catch (error) {
    console.error("GET LEGAL CASE DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load legal case details." },
      { status: 500 }
    );
  }
}