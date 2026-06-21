import { db } from "@/lib/db";
import type {
  LegalCaseDetails,
  LegalCaseEvidence,
  LegalCaseItem,
  LegalCaseLabReport,
  LegalCaseTeamMember,
} from "@/models/legal-case.model";

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

export async function getLegalCases(
  lawyerId: number
): Promise<LegalCaseItem[]> {
  const lawyer = await getActiveLawyer(lawyerId);

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
      COUNT(DISTINCT CASE WHEN e.status = 'Analyzed' THEN e.id END) AS analyzed_evidence_count,
      COUNT(DISTINCT lr.id) AS lab_report_count
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN evidence e
      ON e.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    WHERE cta.user_id = ?
      AND cta.role = 'Lawyer'
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
    [lawyer.id]
  );

  return rows as LegalCaseItem[];
}

export async function getLegalCaseDetails(
  lawyerId: number,
  caseId: number
): Promise<LegalCaseDetails | null> {
  const lawyer = await getActiveLawyer(lawyerId);

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
      COUNT(DISTINCT CASE WHEN e.status = 'Analyzed' THEN e.id END) AS analyzed_evidence_count,
      COUNT(DISTINCT lr.id) AS lab_report_count
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN evidence e
      ON e.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    WHERE c.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Lawyer'
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
    [caseId, lawyer.id]
  );

  const legalCase = (caseRows as LegalCaseItem[])[0];

  if (!legalCase) {
    return null;
  }

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
    ORDER BY cta.role ASC, u.full_name ASC
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
      blockchain_tx_hash,
      blockchain_status,
      created_at
    FROM evidence
    WHERE case_id = ?
    ORDER BY created_at DESC
    `,
    [caseId]
  );

  const [labReportRows] = await db.query(
    `
    SELECT
      lr.id,
      lr.evidence_id,
      lr.analyzed_by,
      lr.analysis_type,
      lr.result,
      lr.conclusion,
      lr.attachment_name,
      lr.attachment_mime_type,
      lr.attachment_size,
      lr.attachment_hash,
      lr.attachment_ipfs_cid,
      lr.created_at,
      e.evidence_type,
      e.file_hash
    FROM lab_results lr
    INNER JOIN evidence e
      ON e.id = lr.evidence_id
    WHERE e.case_id = ?
    ORDER BY lr.created_at DESC
    `,
    [caseId]
  );

  return {
    ...legalCase,
    team: teamRows as LegalCaseTeamMember[],
    evidence: evidenceRows as LegalCaseEvidence[],
    labReports: labReportRows as LegalCaseLabReport[],
  };
}