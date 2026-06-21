import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  createJudgeVerdict,
  deleteJudgeVerdict,
  getJudgeVerdictsWorkspace,
  updateJudgeVerdict,
} from "@/services/judge-verdict.service";
import {
  getRequestIp,
  recordAuditLog,
} from "@/services/audit-helper.service";
import type {
  JudgeVerdictDecision,
  JudgeVerdictStatus,
} from "@/models/judge-verdict.model";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

const allowedDecisions: JudgeVerdictDecision[] = [
  "Guilty",
  "Not Guilty",
  "Dismissed",
  "Pending Further Review",
  "Other",
];

const allowedStatuses: JudgeVerdictStatus[] = ["Draft", "Final", "Archived"];

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

function validateBody(body: Record<string, unknown>) {
  const caseId = Number(body.case_id);
  const verdictTitle = String(body.verdict_title || "").trim();
  const decision = String(body.decision || "") as JudgeVerdictDecision;
  const verdictSummary = String(body.verdict_summary || "").trim();

  const sentenceText =
    typeof body.sentence_text === "string" && body.sentence_text.trim()
      ? body.sentence_text.trim()
      : null;

  const status = String(body.status || "") as JudgeVerdictStatus;

  if (!Number.isFinite(caseId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Please choose a valid case." },
        { status: 400 }
      ),
    };
  }

  if (!verdictTitle) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Verdict title is required." },
        { status: 400 }
      ),
    };
  }

  if (!allowedDecisions.includes(decision)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Please choose a valid decision." },
        { status: 400 }
      ),
    };
  }

  if (!verdictSummary) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Verdict summary is required." },
        { status: 400 }
      ),
    };
  }

  if (!allowedStatuses.includes(status)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Please choose a valid verdict status." },
        { status: 400 }
      ),
    };
  }

  return {
    ok: true as const,
    input: {
      case_id: caseId,
      verdict_title: verdictTitle,
      decision,
      verdict_summary: verdictSummary,
      sentence_text: sentenceText,
      status,
    },
  };
}

export async function handleGetJudgeVerdicts(request: NextRequest) {
  try {
    const auth = await getJudgeIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const data = await getJudgeVerdictsWorkspace(auth.judgeId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET JUDGE VERDICTS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load judge verdicts." },
      { status: 500 }
    );
  }
}

export async function handleCreateJudgeVerdict(request: NextRequest) {
  try {
    const auth = await getJudgeIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validation = validateBody(body);

    if (!validation.ok) return validation.response;

    const result = await createJudgeVerdict(auth.judgeId, validation.input);

    await recordAuditLog({
      actor_name: result.judge.full_name,
      actor_role: "Judge",
      action: "Created verdict",
      entity_type: "Verdict",
      entity_id: String(result.verdictId),
      status: validation.input.status === "Final" ? "Critical" : "Success",
      details: `Created verdict #${result.verdictId}: ${validation.input.verdict_title}. Decision: ${validation.input.decision}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Verdict created successfully.",
      verdictId: result.verdictId,
    });
  } catch (error) {
    console.error("CREATE JUDGE VERDICT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create verdict.",
      },
      { status: 500 }
    );
  }
}

export async function handleUpdateJudgeVerdict(
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

    const body = await request.json();
    const validation = validateBody(body);

    if (!validation.ok) return validation.response;

    const result = await updateJudgeVerdict(
      auth.judgeId,
      numericVerdictId,
      validation.input
    );

    await recordAuditLog({
      actor_name: result.judge.full_name,
      actor_role: "Judge",
      action: "Updated verdict",
      entity_type: "Verdict",
      entity_id: String(result.verdictId),
      status: validation.input.status === "Final" ? "Critical" : "Success",
      details: `Updated verdict #${result.verdictId}: ${validation.input.verdict_title}. Decision: ${validation.input.decision}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Verdict updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE JUDGE VERDICT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update verdict.",
      },
      { status: 500 }
    );
  }
}

export async function handleDeleteJudgeVerdict(
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

    const result = await deleteJudgeVerdict(auth.judgeId, numericVerdictId);

    await recordAuditLog({
      actor_name: result.judge.full_name,
      actor_role: "Judge",
      action: "Deleted verdict",
      entity_type: "Verdict",
      entity_id: String(result.verdictId),
      status: "Warning",
      details: `Deleted verdict #${result.verdictId}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Verdict deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE JUDGE VERDICT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete verdict.",
      },
      { status: 500 }
    );
  }
}