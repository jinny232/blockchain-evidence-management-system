import { db } from "@/lib/db";
import type {
  InvestigatorCaseAuditLog,
  InvestigatorCaseDetailResponse,
  InvestigatorCaseEvidence,
  InvestigatorCaseListItem,
  InvestigatorCaseTeamMember,
} from "@/models/investigator-case.model";

export async function getInvestigatorCases(
  investigatorId: number
): Promise<InvestigatorCaseListItem[]> {
  const [rows] = await db.query(
    `
    SELECT
      c.id,
      c.case_code,
      c.title,
      c.description,
      c.priority,
      c.status,
      c.lead_investigator,
      c.created_at,
      c.updated_at,
      COUNT(DISTINCT e.id) AS evidence_count,
      COUNT(DISTINCT cta_all.user_id) AS team_count
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN evidence e
      ON e.case_id = c.id
    LEFT JOIN case_team_assignments cta_all
      ON cta_all.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Investigator'
    GROUP BY
      c.id,
      c.case_code,
      c.title,
      c.description,
      c.priority,
      c.status,
      c.lead_investigator,
      c.created_at,
      c.updated_at
    ORDER BY c.created_at DESC
    `,
    [investigatorId]
  );

  return rows as InvestigatorCaseListItem[];
}

export async function getInvestigatorCaseDetails(
  investigatorId: number,
  caseId: number
): Promise<InvestigatorCaseDetailResponse | null> {
  const [caseRows] = await db.query(
    `
    SELECT
      c.id,
      c.case_code,
      c.title,
      c.description,
      c.priority,
      c.status,
      c.lead_investigator,
      c.created_at,
      c.updated_at,
      COUNT(DISTINCT e.id) AS evidence_count,
      COUNT(DISTINCT cta_all.user_id) AS team_count
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN evidence e
      ON e.case_id = c.id
    LEFT JOIN case_team_assignments cta_all
      ON cta_all.case_id = c.id
    WHERE c.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Investigator'
    GROUP BY
      c.id,
      c.case_code,
      c.title,
      c.description,
      c.priority,
      c.status,
      c.lead_investigator,
      c.created_at,
      c.updated_at
    LIMIT 1
    `,
    [caseId, investigatorId]
  );

  const cases = caseRows as InvestigatorCaseListItem[];

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
    INNER JOIN users u
      ON u.id = cta.user_id
    WHERE cta.case_id = ?
    ORDER BY
      FIELD(cta.role, 'Investigator', 'Lab Technician', 'Lawyer', 'Judge'),
      u.full_name
    `,
    [caseId]
  );

  const [evidenceRows] = await db.query(
    `
    SELECT
      id,
      case_id,
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
    [caseId]
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
      (entity_type = 'Case' AND (entity_id = ? OR entity_id = ?))
      OR details LIKE ?
    ORDER BY created_at DESC
    LIMIT 10
    `,
    [String(caseId), caseRecord.case_code, `%${caseRecord.case_code}%`]
  );

  return {
    caseRecord,
    team: teamRows as InvestigatorCaseTeamMember[],
    evidence: evidenceRows as InvestigatorCaseEvidence[],
    auditLogs: auditRows as InvestigatorCaseAuditLog[],
  };
}