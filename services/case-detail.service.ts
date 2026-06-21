import { db } from "@/lib/db";
import type {
  CaseDetailAuditLog,
  CaseDetailEvidence,
  CaseDetailRecord,
  CaseDetailResponse,
  CaseDetailTeamMember,
} from "@/models/case-detail.model";

export async function getCaseDetails(id: string): Promise<CaseDetailResponse | null> {
  const [caseRows] = await db.query(
    `
    SELECT
      id,
      case_code,
      title,
      description,
      priority,
      status,
      lead_investigator,
      created_at,
      updated_at
    FROM cases
    WHERE id = ?
    `,
    [id]
  );

  const cases = caseRows as CaseDetailRecord[];

  if (cases.length === 0) {
    return null;
  }

  const caseRecord = cases[0];

  const [teamRows] = await db.query(
    `
    SELECT
      cta.id,
      cta.user_id,
      u.full_name,
      u.username,
      u.email,
      cta.role,
      cta.assigned_by,
      cta.created_at
    FROM case_team_assignments cta
    INNER JOIN users u ON u.id = cta.user_id
    WHERE cta.case_id = ?
    ORDER BY cta.role, u.full_name
    `,
    [id]
  );

  const [evidenceRows] = await db.query(
    `
    SELECT
      id,
      evidence_type,
      description,
      file_hash,
      ipfs_cid,
      submitted_by,
      status,
      created_at
    FROM evidence
    WHERE case_id = ?
    ORDER BY created_at DESC
    `,
    [id]
  );

  const [auditRows] = await db.query(
    `
    SELECT
      id,
      actor_name,
      actor_role,
      action,
      status,
      details,
      created_at
    FROM audit_logs
    WHERE
      (entity_type = 'Case' AND entity_id = ?)
      OR details LIKE ?
    ORDER BY created_at DESC
    LIMIT 20
    `,
    [id, `%${caseRecord.case_code}%`]
  );

  return {
    caseRecord,
    team: teamRows as CaseDetailTeamMember[],
    evidence: evidenceRows as CaseDetailEvidence[],
    auditLogs: auditRows as CaseDetailAuditLog[],
  };
}