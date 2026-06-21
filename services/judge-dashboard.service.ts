import { db } from "@/lib/db";
import type {
  JudgeAssignedCase,
  JudgeDashboardResponse,
  JudgeRecentEvidence,
  JudgeRecentLabReport,
  JudgeRecentLegalNote,
  JudgeUserInfo,
} from "@/models/judge-dashboard.model";

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

export async function getJudgeDashboardData(
  judgeId: number
): Promise<JudgeDashboardResponse> {
  const judge = await getActiveJudge(judgeId);

  const [caseStatsRows] = await db.query(
    `
    SELECT
      COUNT(DISTINCT c.id) AS assignedCases,
      SUM(CASE WHEN c.status = 'Open' THEN 1 ELSE 0 END) AS openCases,
      SUM(CASE WHEN c.status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressCases,
      SUM(CASE WHEN c.status = 'Closed' THEN 1 ELSE 0 END) AS closedCases
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Judge'
    `,
    [judge.id]
  );

  const caseStats = (
    caseStatsRows as {
      assignedCases: number;
      openCases: number;
      inProgressCases: number;
      closedCases: number;
    }[]
  )[0];

  const [evidenceStatsRows] = await db.query(
    `
    SELECT
      COUNT(DISTINCT e.id) AS totalEvidence,
      SUM(CASE WHEN e.status = 'Analyzed' THEN 1 ELSE 0 END) AS analyzedEvidence
    FROM evidence e
    INNER JOIN case_team_assignments cta
      ON cta.case_id = e.case_id
    WHERE cta.user_id = ?
      AND cta.role = 'Judge'
    `,
    [judge.id]
  );

  const evidenceStats = (
    evidenceStatsRows as {
      totalEvidence: number;
      analyzedEvidence: number;
    }[]
  )[0];

  const [reportStatsRows] = await db.query(
    `
    SELECT COUNT(DISTINCT lr.id) AS totalLabReports
    FROM lab_results lr
    INNER JOIN evidence e
      ON e.id = lr.evidence_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = e.case_id
    WHERE cta.user_id = ?
      AND cta.role = 'Judge'
    `,
    [judge.id]
  );

  const totalLabReports = Number(
    (reportStatsRows as { totalLabReports: number }[])[0]?.totalLabReports || 0
  );

  const [noteStatsRows] = await db.query(
    `
    SELECT COUNT(DISTINCT ln.id) AS finalLegalNotes
    FROM legal_notes ln
    INNER JOIN case_team_assignments cta
      ON cta.case_id = ln.case_id
    WHERE cta.user_id = ?
      AND cta.role = 'Judge'
      AND ln.status = 'Final'
    `,
    [judge.id]
  );

  const finalLegalNotes = Number(
    (noteStatsRows as { finalLegalNotes: number }[])[0]?.finalLegalNotes || 0
  );

  const [assignedCaseRows] = await db.query(
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
      COUNT(DISTINCT e.id) AS evidence_count,
      COUNT(DISTINCT CASE WHEN e.status = 'Analyzed' THEN e.id END) AS analyzed_evidence_count,
      COUNT(DISTINCT lr.id) AS lab_report_count,
      COUNT(DISTINCT CASE WHEN ln.status = 'Final' THEN ln.id END) AS final_note_count
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN evidence e
      ON e.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    LEFT JOIN legal_notes ln
      ON ln.case_id = c.id
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
      c.created_at
    ORDER BY c.created_at DESC
    LIMIT 8
    `,
    [judge.id]
  );

  const [recentEvidenceRows] = await db.query(
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
      e.created_at
    FROM evidence e
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Judge'
    ORDER BY e.created_at DESC
    LIMIT 8
    `,
    [judge.id]
  );

  const [recentLabReportRows] = await db.query(
    `
    SELECT
      lr.id,
      lr.evidence_id,
      lr.analyzed_by,
      lr.analysis_type,
      lr.conclusion,
      lr.created_at,
      c.case_code,
      c.title AS case_title,
      e.evidence_type
    FROM lab_results lr
    INNER JOIN evidence e
      ON e.id = lr.evidence_id
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Judge'
    ORDER BY lr.created_at DESC
    LIMIT 6
    `,
    [judge.id]
  );

  const [recentLegalNoteRows] = await db.query(
    `
    SELECT
      ln.id,
      ln.case_id,
      c.case_code,
      c.title AS case_title,
      ln.evidence_id,
      ln.note_type,
      ln.title,
      ln.status,
      ln.updated_at,
      u.full_name AS lawyer_name
    FROM legal_notes ln
    INNER JOIN cases c
      ON c.id = ln.case_id
    INNER JOIN users u
      ON u.id = ln.lawyer_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Judge'
    ORDER BY ln.updated_at DESC
    LIMIT 6
    `,
    [judge.id]
  );

  return {
    judge,
    stats: {
      assignedCases: Number(caseStats?.assignedCases || 0),
      openCases: Number(caseStats?.openCases || 0),
      inProgressCases: Number(caseStats?.inProgressCases || 0),
      closedCases: Number(caseStats?.closedCases || 0),
      totalEvidence: Number(evidenceStats?.totalEvidence || 0),
      analyzedEvidence: Number(evidenceStats?.analyzedEvidence || 0),
      totalLabReports,
      finalLegalNotes,
    },
    assignedCases: assignedCaseRows as JudgeAssignedCase[],
    recentEvidence: recentEvidenceRows as JudgeRecentEvidence[],
    recentLabReports: recentLabReportRows as JudgeRecentLabReport[],
    recentLegalNotes: recentLegalNoteRows as JudgeRecentLegalNote[],
  };
}