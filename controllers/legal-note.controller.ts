import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  createLegalNote,
  deleteLegalNote,
  getLegalNotesWorkspace,
  updateLegalNote,
} from "@/services/legal-note.service";
import {
  getRequestIp,
  recordAuditLog,
} from "@/services/audit-helper.service";
import type {
  LegalNoteStatus,
  LegalNoteType,
} from "@/models/legal-note.model";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

const allowedNoteTypes: LegalNoteType[] = [
  "Case Opinion",
  "Evidence Remark",
  "Court Preparation",
  "Objection",
  "Other",
];

const allowedStatuses: LegalNoteStatus[] = ["Draft", "Final", "Archived"];

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

function validateBody(body: Record<string, unknown>) {
  const caseId = Number(body.case_id);
  const evidenceId =
    body.evidence_id === null ||
    body.evidence_id === undefined ||
    body.evidence_id === ""
      ? null
      : Number(body.evidence_id);

  const noteType = String(body.note_type || "") as LegalNoteType;
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();

  const recommendation =
    typeof body.recommendation === "string" && body.recommendation.trim()
      ? body.recommendation.trim()
      : null;

  const status = String(body.status || "") as LegalNoteStatus;

  if (!Number.isFinite(caseId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Please choose a valid case." },
        { status: 400 }
      ),
    };
  }

  if (evidenceId !== null && !Number.isFinite(evidenceId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Please choose a valid evidence record." },
        { status: 400 }
      ),
    };
  }

  if (!allowedNoteTypes.includes(noteType)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Please choose a valid note type." },
        { status: 400 }
      ),
    };
  }

  if (!title) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Title is required." },
        { status: 400 }
      ),
    };
  }

  if (!content) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Note content is required." },
        { status: 400 }
      ),
    };
  }

  if (!allowedStatuses.includes(status)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Please choose a valid note status." },
        { status: 400 }
      ),
    };
  }

  return {
    ok: true as const,
    input: {
      case_id: caseId,
      evidence_id: evidenceId,
      note_type: noteType,
      title,
      content,
      recommendation,
      status,
    },
  };
}

export async function handleGetLegalNotes(request: NextRequest) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const data = await getLegalNotesWorkspace(auth.lawyerId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET LEGAL NOTES ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load legal notes." },
      { status: 500 }
    );
  }
}

export async function handleCreateLegalNote(request: NextRequest) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validation = validateBody(body);

    if (!validation.ok) return validation.response;

    const result = await createLegalNote(auth.lawyerId, validation.input);

    await recordAuditLog({
      actor_name: result.lawyer.full_name,
      actor_role: "Lawyer",
      action: "Created legal note",
      entity_type: "Legal Note",
      entity_id: String(result.noteId),
      status: "Success",
      details: `Created legal note #${result.noteId}: ${validation.input.title}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Legal note created successfully.",
      noteId: result.noteId,
    });
  } catch (error) {
    console.error("CREATE LEGAL NOTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create note.",
      },
      { status: 500 }
    );
  }
}

export async function handleUpdateLegalNote(
  request: NextRequest,
  noteId: string
) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericNoteId = Number(noteId);

    if (!Number.isFinite(numericNoteId)) {
      return NextResponse.json(
        { message: "Invalid note ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = validateBody(body);

    if (!validation.ok) return validation.response;

    const result = await updateLegalNote(
      auth.lawyerId,
      numericNoteId,
      validation.input
    );

    await recordAuditLog({
      actor_name: result.lawyer.full_name,
      actor_role: "Lawyer",
      action: "Updated legal note",
      entity_type: "Legal Note",
      entity_id: String(result.noteId),
      status: "Success",
      details: `Updated legal note #${result.noteId}: ${validation.input.title}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Legal note updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE LEGAL NOTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update note.",
      },
      { status: 500 }
    );
  }
}

export async function handleDeleteLegalNote(
  request: NextRequest,
  noteId: string
) {
  try {
    const auth = await getLawyerIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericNoteId = Number(noteId);

    if (!Number.isFinite(numericNoteId)) {
      return NextResponse.json(
        { message: "Invalid note ID." },
        { status: 400 }
      );
    }

    const result = await deleteLegalNote(auth.lawyerId, numericNoteId);

    await recordAuditLog({
      actor_name: result.lawyer.full_name,
      actor_role: "Lawyer",
      action: "Deleted legal note",
      entity_type: "Legal Note",
      entity_id: String(result.noteId),
      status: "Warning",
      details: `Deleted legal note #${result.noteId}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Legal note deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE LEGAL NOTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete note.",
      },
      { status: 500 }
    );
  }
}