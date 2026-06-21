import { db } from "@/lib/db";
import type {
  JudgeCaseDetails,
  JudgeCaseEvidence,
  JudgeCaseItem,
  JudgeCaseLabReport,
  JudgeCaseLegalNote,
  JudgeCaseTeamMember,
  JudgeCaseVerdict,
} from "@/models/judge-case.model";

type JudgeUserInfo = {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
};

async function getActiveJudge(judgeId: number) {
  const [rows] = await db.query(
    `
    SELECT id, full_name, username, email
    FROM users
    WHERE id = ?
      AND role = 'Judge'
      AND active = 1
    LIMIT 1
    `,
    [judgeId]
  );

  const users = rows as JudgeUserInfo[];

  if (users.length === 0) {
    throw new Error("Judge account not found.");
  }

  return users[0];
}

export async function getJudgeCases(
  judgeId: number
): Promise<JudgeCaseItem[]> {
  const judge = await getActiveJudge(judgeId);

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
      COUNT(DISTINCT lr.id) AS lab_report_count,
      COUNT(DISTINCT CASE WHEN ln.status = 'Final' THEN ln.id END) AS final_note_count,
      COUNT(DISTINCT cv.id) AS verdict_count
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN evidence e
      ON e.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    LEFT JOIN legal_notes ln
      ON ln.case_id = c.id
    LEFT JOIN court_verdicts cv
      ON cv.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Judge'
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
    [judge.id]
  );

  return rows as JudgeCaseItem[];
}

export async function getJudgeCaseDetails(
  judgeId: number,
  caseId: number
): Promise<JudgeCaseDetails | null> {
  const judge = await getActiveJudge(judgeId);

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
      COUNT(DISTINCT lr.id) AS lab_report_count,
      COUNT(DISTINCT CASE WHEN ln.status = 'Final' THEN ln.id END) AS final_note_count,
      COUNT(DISTINCT cv.id) AS verdict_count
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN evidence e
      ON e.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    LEFT JOIN legal_notes ln
      ON ln.case_id = c.id
    LEFT JOIN court_verdicts cv
      ON cv.case_id = c.id
    WHERE c.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Judge'
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
    [caseId, judge.id]
  );

  const judgeCase = (caseRows as JudgeCaseItem[])[0];

  if (!judgeCase) {
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

  const [legalNoteRows] = await db.query(
    `
    SELECT
      ln.id,
      ln.lawyer_id,
      u.full_name AS lawyer_name,
      ln.case_id,
      ln.evidence_id,
      ln.note_type,
      ln.title,
      ln.content,
      ln.recommendation,
      ln.status,
      ln.updated_at
    FROM legal_notes ln
    INNER JOIN users u
      ON u.id = ln.lawyer_id
    WHERE ln.case_id = ?
    ORDER BY
      CASE WHEN ln.status = 'Final' THEN 0 ELSE 1 END,
      ln.updated_at DESC
    `,
    [caseId]
  );

  const [verdictRows] = await db.query(
    `
    SELECT
      cv.id,
      cv.judge_id,
      u.full_name AS judge_name,
      cv.case_id,
      cv.verdict_title,
      cv.decision,
      cv.verdict_summary,
      cv.sentence_text,
      cv.status,
      cv.created_at,
      cv.updated_at
    FROM court_verdicts cv
    INNER JOIN users u
      ON u.id = cv.judge_id
    WHERE cv.case_id = ?
    ORDER BY cv.updated_at DESC
    `,
    [caseId]
  );

  return {
    ...judgeCase,
    team: teamRows as JudgeCaseTeamMember[],
    evidence: evidenceRows as JudgeCaseEvidence[],
    labReports: labReportRows as JudgeCaseLabReport[],
    legalNotes: legalNoteRows as JudgeCaseLegalNote[],
    verdicts: verdictRows as JudgeCaseVerdict[],
  };
}