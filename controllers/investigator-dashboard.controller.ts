import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getInvestigatorDashboardData } from "@/services/investigator-dashboard.service";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

export async function handleGetInvestigatorDashboard(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized. Please login again." },
        { status: 401 }
      );
    }

    const session = (await verifySessionToken(token)) as SessionLike;

    if (session.role !== "Investigator") {
      return NextResponse.json(
        { message: "Forbidden. Investigator access only." },
        { status: 403 }
      );
    }

    const rawUserId = session.id ?? session.userId;
    const investigatorId = Number(rawUserId);

    if (!Number.isFinite(investigatorId)) {
      return NextResponse.json(
        { message: "Invalid investigator session." },
        { status: 401 }
      );
    }

    const data = await getInvestigatorDashboardData(investigatorId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET INVESTIGATOR DASHBOARD ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load investigator dashboard." },
      { status: 500 }
    );
  }
}