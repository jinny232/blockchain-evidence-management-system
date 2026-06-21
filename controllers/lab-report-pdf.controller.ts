import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  generateLabReportPdf,
  getLabReportForPdf,
} from "@/services/lab-report-pdf.service";

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

export async function handleDownloadLabReportPdf(
  request: NextRequest,
  reportId: string
) {
  try {
    const auth = await getLabTechnicianIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericReportId = Number(reportId);

    if (!Number.isFinite(numericReportId)) {
      return NextResponse.json(
        { message: "Invalid report ID." },
        { status: 400 }
      );
    }

    const report = await getLabReportForPdf(auth.technicianId, numericReportId);

    if (!report) {
      return NextResponse.json(
        { message: "Lab report not found or not assigned to you." },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateLabReportPdf(report);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="lab-report-${report.id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("DOWNLOAD LAB REPORT PDF ERROR:", error);

    return NextResponse.json(
      { message: "Failed to generate lab report PDF." },
      { status: 500 }
    );
  }
}