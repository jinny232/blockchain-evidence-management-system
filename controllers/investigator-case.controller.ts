import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  getInvestigatorCaseDetails,
  getInvestigatorCases,
} from "@/services/investigator-case.service";

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

export async function handleGetInvestigatorCases(request: NextRequest) {
  try {
    const auth = await getInvestigatorIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const cases = await getInvestigatorCases(auth.investigatorId);

    return NextResponse.json(cases);
  } catch (error) {
    console.error("GET INVESTIGATOR CASES ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load assigned cases." },
      { status: 500 }
    );
  }
}

export async function handleGetInvestigatorCaseDetails(
  request: NextRequest,
  caseId: string
) {
  try {
    const auth = await getInvestigatorIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericCaseId = Number(caseId);

    if (!Number.isFinite(numericCaseId)) {
      return NextResponse.json(
        { message: "Invalid case ID." },
        { status: 400 }
      );
    }

    const data = await getInvestigatorCaseDetails(
      auth.investigatorId,
      numericCaseId
    );

    if (!data) {
      return NextResponse.json(
        { message: "Case not found or not assigned to you." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET INVESTIGATOR CASE DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load case details." },
      { status: 500 }
    );
  }
}