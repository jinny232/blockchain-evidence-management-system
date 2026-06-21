import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getEvidenceTimeline } from "@/services/evidence-timeline.service";

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
];

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

  if (!session.role || !allowedRoles.includes(session.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Invalid role." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}

export async function handleGetEvidenceTimeline(
  request: NextRequest,
  evidenceId: string
) {
  try {
    const auth = await getSessionFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericEvidenceId = Number(evidenceId);

    if (!Number.isFinite(numericEvidenceId)) {
      return NextResponse.json(
        { message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const data = await getEvidenceTimeline(numericEvidenceId);

    if (!data) {
      return NextResponse.json(
        { message: "Evidence timeline not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET EVIDENCE TIMELINE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load evidence timeline." },
      { status: 500 }
    );
  }
}