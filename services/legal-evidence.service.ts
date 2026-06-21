import { db } from "@/lib/db";
import type {
  LegalEvidenceDetails,
  LegalEvidenceItem,
  LegalEvidenceLabReport,
} from "@/models/legal-evidence.model";

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

export async function getLegalEvidence(
  lawyerId: number
): Promise<LegalEvidenceItem[]> {
  const lawyer = await getActiveLawyer(lawyerId);

  const [rows] = await db.query(
    `
    SELECT
      e.id,
      e.case_id,
      c.case_code,
      c.title AS case_title,
      e.evidence_type,
      e.description,
      e.file_hash,
      e.ipfs_cid,
      e.submitted_by,
      e.status,
      e.blockchain_tx_hash,
      e.blockchain_status,
      e.created_at,
      e.updated_at,
      COUNT(DISTINCT lr.id) AS lab_report_count,
      MAX(lr.conclusion) AS latest_conclusion
    FROM evidence e
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    WHERE cta.user_id = ?
      AND cta.role = 'Lawyer'
    GROUP BY
      e.id,
      e.case_id,
      c.case_code,
      c.title,
      e.evidence_type,
      e.description,
      e.file_hash,
      e.ipfs_cid,
      e.submitted_by,
      e.status,
      e.blockchain_tx_hash,
      e.blockchain_status,
      e.created_at,
      e.updated_at
    ORDER BY e.created_at DESC
    `,
    [lawyer.id]
  );

  return rows as LegalEvidenceItem[];
}

export async function getLegalEvidenceDetails(
  lawyerId: number,
  evidenceId: number
): Promise<LegalEvidenceDetails | null> {
  const lawyer = await getActiveLawyer(lawyerId);

  const [rows] = await db.query(
    `
    SELECT
      e.id,
      e.case_id,
      c.case_code,
      c.title AS case_title,
      e.evidence_type,
      e.description,
      e.file_hash,
      e.ipfs_cid,
      e.submitted_by,
      e.status,
      e.blockchain_tx_hash,
      e.blockchain_status,
      e.created_at,
      e.updated_at,
      COUNT(DISTINCT lr.id) AS lab_report_count,
      MAX(lr.conclusion) AS latest_conclusion
    FROM evidence e
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    WHERE e.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Lawyer'
    GROUP BY
      e.id,
      e.case_id,
      c.case_code,
      c.title,
      e.evidence_type,
      e.description,
      e.file_hash,
      e.ipfs_cid,
      e.submitted_by,
      e.status,
      e.blockchain_tx_hash,
      e.blockchain_status,
      e.created_at,
      e.updated_at
    LIMIT 1
    `,
    [evidenceId, lawyer.id]
  );

  const evidence = (rows as LegalEvidenceItem[])[0];

  if (!evidence) {
    return null;
  }

  const [reportRows] = await db.query(
    `
    SELECT
      id,
      evidence_id,
      analyzed_by,
      analysis_type,
      result,
      conclusion,
      attachment_name,
      attachment_mime_type,
      attachment_size,
      attachment_hash,
      attachment_ipfs_cid,
      created_at
    FROM lab_results
    WHERE evidence_id = ?
    ORDER BY created_at DESC
    `,
    [evidenceId]
  );

  return {
    ...evidence,
    reports: reportRows as LegalEvidenceLabReport[],
  };
}