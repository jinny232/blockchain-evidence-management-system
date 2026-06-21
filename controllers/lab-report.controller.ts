import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getLabReports } from "@/services/lab-report.service";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

async function getLabTechnicianIdFromRequest(request: NextRequest) {
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

  if (session.role !== "Lab Technician") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Lab Technician access only." },
        { status: 403 }
      ),
    };
  }

  const rawUserId = session.id ?? session.userId;
  const technicianId = Number(rawUserId);

  if (!Number.isFinite(technicianId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Invalid lab technician session." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    technicianId,
  };
}

export async function handleGetLabReports(request: NextRequest) {
  try {
    const auth = await getLabTechnicianIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const reports = await getLabReports(auth.technicianId);

    return NextResponse.json(reports);
  } catch (error) {
    console.error("GET LAB REPORTS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load lab reports." },
      { status: 500 }
    );
  }
}