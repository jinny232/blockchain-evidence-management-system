import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  generateJudgeVerdictPdf,
  getJudgeVerdictForPdf,
} from "@/services/judge-verdict-pdf.service";

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

export async function handleDownloadJudgeVerdictPdf(
  request: NextRequest,
  verdictId: string
) {
  try {
    const auth = await getJudgeIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericVerdictId = Number(verdictId);

    if (!Number.isFinite(numericVerdictId)) {
      return NextResponse.json(
        { message: "Invalid verdict ID." },
        { status: 400 }
      );
    }

    const verdict = await getJudgeVerdictForPdf(
      auth.judgeId,
      numericVerdictId
    );

    if (!verdict) {
      return NextResponse.json(
        { message: "Verdict not found or not assigned to you." },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateJudgeVerdictPdf(verdict);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="court-verdict-${verdict.id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("DOWNLOAD JUDGE VERDICT PDF ERROR:", error);

    return NextResponse.json(
      { message: "Failed to generate verdict PDF." },
      { status: 500 }
    );
  }
}