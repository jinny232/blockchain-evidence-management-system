import type { ResultSetHeader } from "mysql2";
import { db } from "@/lib/db";
import type {
  CreateLegalNoteInput,
  LegalNote,
  LegalNoteCaseOption,
  LegalNoteEvidenceOption,
  LegalNotesResponse,
  UpdateLegalNoteInput,
} from "@/models/legal-note.model";

type LegalUserInfo = {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
};

async function getActiveLawyer(lawyerId: number) {
  const [rows] = await db.query(
    `
    SELECT id, full_name, username, email
    FROM users
    WHERE id = ?
      AND role = 'Lawyer'
      AND active = 1
    LIMIT 1
    `,
    [lawyerId]
  );

  const users = rows as LegalUserInfo[];

  if (users.length === 0) {
    throw new Error("Lawyer account not found.");
  }

  return users[0];
}

async function ensureCaseAssignedToLawyer(lawyerId: number, caseId: number) {
  const [rows] = await db.query(
    `
    SELECT c.id
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE c.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Lawyer'
    LIMIT 1
    `,
    [caseId, lawyerId]
  );

  if ((rows as { id: number }[]).length === 0) {
    throw new Error("This case is not assigned to you.");
  }
}

async function ensureEvidenceAssignedToLawyer(
  lawyerId: number,
  evidenceId: number,
  caseId: number
) {
  const [rows] = await db.query(
    `
    SELECT e.id
    FROM evidence e
    INNER JOIN case_team_assignments cta
      ON cta.case_id = e.case_id
    WHERE e.id = ?
      AND e.case_id = ?
      AND cta.user_id = ?
      AND cta.role = 'Lawyer'
    LIMIT 1
    `,
    [evidenceId, caseId, lawyerId]
  );

  if ((rows as { id: number }[]).length === 0) {
    throw new Error("This evidence is not assigned to you.");
  }
}

export async function getLegalNotesWorkspace(
  lawyerId: number
): Promise<LegalNotesResponse> {
  const lawyer = await getActiveLawyer(lawyerId);

  const [noteRows] = await db.query(
    `
    SELECT
      ln.id,
      ln.lawyer_id,
      u.full_name AS lawyer_name,
      ln.case_id,
      c.case_code,
      c.title AS case_title,
      ln.evidence_id,
      e.evidence_type,
      e.file_hash AS evidence_hash,
      ln.note_type,
      ln.title,
      ln.content,
      ln.recommendation,
      ln.status,
      ln.created_at,
      ln.updated_at
    FROM legal_notes ln
    INNER JOIN users u
      ON u.id = ln.lawyer_id
    LEFT JOIN cases c
      ON c.id = ln.case_id
    LEFT JOIN evidence e
      ON e.id = ln.evidence_id
    WHERE ln.lawyer_id = ?
    ORDER BY ln.updated_at DESC
    `,
    [lawyer.id]
  );

  const [caseRows] = await db.query(
    `
    SELECT
      c.id,
      c.case_code,
      c.title
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Lawyer'
    ORDER BY c.created_at DESC
    `,
    [lawyer.id]
  );

  const [evidenceRows] = await db.query(
    `
    SELECT
      e.id,
      e.case_id,
      c.case_code,
      c.title AS case_title,
      e.evidence_type,
      e.status,
      e.file_hash
    FROM evidence e
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Lawyer'
    ORDER BY e.created_at DESC
    `,
    [lawyer.id]
  );

  return {
    notes: noteRows as LegalNote[],
    cases: caseRows as LegalNoteCaseOption[],
    evidence: evidenceRows as LegalNoteEvidenceOption[],
  };
}

export async function createLegalNote(
  lawyerId: number,
  input: CreateLegalNoteInput
) {
  const lawyer = await getActiveLawyer(lawyerId);

  await ensureCaseAssignedToLawyer(lawyer.id, input.case_id);

  if (input.evidence_id) {
    await ensureEvidenceAssignedToLawyer(
      lawyer.id,
      input.evidence_id,
      input.case_id
    );
  }

  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO legal_notes (
      lawyer_id,
      case_id,
      evidence_id,
      note_type,
      title,
      content,
      recommendation,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      lawyer.id,
      input.case_id,
      input.evidence_id,
      input.note_type,
      input.title,
      input.content,
      input.recommendation,
      input.status,
    ]
  );

  return {
    lawyer,
    noteId: result.insertId,
  };
}

export async function updateLegalNote(
  lawyerId: number,
  noteId: number,
  input: UpdateLegalNoteInput
) {
  const lawyer = await getActiveLawyer(lawyerId);

  const [noteRows] = await db.query(
    `
    SELECT id
    FROM legal_notes
    WHERE id = ?
      AND lawyer_id = ?
    LIMIT 1
    `,
    [noteId, lawyer.id]
  );

  if ((noteRows as { id: number }[]).length === 0) {
    throw new Error("Legal note not found or not created by you.");
  }

  await ensureCaseAssignedToLawyer(lawyer.id, input.case_id);

  if (input.evidence_id) {
    await ensureEvidenceAssignedToLawyer(
      lawyer.id,
      input.evidence_id,
      input.case_id
    );
  }

  await db.query(
    `
    UPDATE legal_notes
    SET
      case_id = ?,
      evidence_id = ?,
      note_type = ?,
      title = ?,
      content = ?,
      recommendation = ?,
      status = ?
    WHERE id = ?
      AND lawyer_id = ?
    `,
    [
      input.case_id,
      input.evidence_id,
      input.note_type,
      input.title,
      input.content,
      input.recommendation,
      input.status,
      noteId,
      lawyer.id,
    ]
  );

  return {
    lawyer,
    noteId,
  };
}

export async function deleteLegalNote(lawyerId: number, noteId: number) {
  const lawyer = await getActiveLawyer(lawyerId);

  const [result] = await db.query<ResultSetHeader>(
    `
    DELETE FROM legal_notes
    WHERE id = ?
      AND lawyer_id = ?
    `,
    [noteId, lawyer.id]
  );

  if (result.affectedRows === 0) {
    throw new Error("Legal note not found or not created by you.");
  }

  return {
    lawyer,
    noteId,
  };
}