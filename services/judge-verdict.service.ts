import type { ResultSetHeader } from "mysql2";
import { db } from "@/lib/db";
import type {
  CreateJudgeVerdictInput,
  JudgeVerdict,
  JudgeVerdictCaseOption,
  JudgeVerdictsResponse,
  UpdateJudgeVerdictInput,
} from "@/models/judge-verdict.model";

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

async function ensureCaseAssignedToJudge(judgeId: number, caseId: number) {
  const [rows] = await db.query(
    `
    SELECT c.id
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE c.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Judge'
    LIMIT 1
    `,
    [caseId, judgeId]
  );

  if ((rows as { id: number }[]).length === 0) {
    throw new Error("This case is not assigned to you.");
  }
}

export async function getJudgeVerdictsWorkspace(
  judgeId: number
): Promise<JudgeVerdictsResponse> {
  const judge = await getActiveJudge(judgeId);

  const [verdictRows] = await db.query(
    `
    SELECT
      cv.id,
      cv.judge_id,
      u.full_name AS judge_name,
      cv.case_id,
      c.case_code,
      c.title AS case_title,
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
    INNER JOIN cases c
      ON c.id = cv.case_id
    WHERE cv.judge_id = ?
    ORDER BY cv.updated_at DESC
    `,
    [judge.id]
  );

  const [caseRows] = await db.query(
    `
    SELECT
      c.id,
      c.case_code,
      c.title,
      c.status,
      COUNT(DISTINCT e.id) AS evidence_count,
      COUNT(DISTINCT lr.id) AS lab_report_count,
      COUNT(DISTINCT CASE WHEN ln.status = 'Final' THEN ln.id END) AS legal_note_count
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
      c.status
    ORDER BY c.created_at DESC
    `,
    [judge.id]
  );

  return {
    verdicts: verdictRows as JudgeVerdict[],
    cases: caseRows as JudgeVerdictCaseOption[],
  };
}

export async function createJudgeVerdict(
  judgeId: number,
  input: CreateJudgeVerdictInput
) {
  const judge = await getActiveJudge(judgeId);

  await ensureCaseAssignedToJudge(judge.id, input.case_id);

  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO court_verdicts (
      judge_id,
      case_id,
      verdict_title,
      decision,
      verdict_summary,
      sentence_text,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      judge.id,
      input.case_id,
      input.verdict_title,
      input.decision,
      input.verdict_summary,
      input.sentence_text,
      input.status,
    ]
  );

  if (input.status === "Final") {
    await db.query(
      `
      UPDATE cases
      SET status = 'Closed'
      WHERE id = ?
      `,
      [input.case_id]
    );
  }

  return {
    judge,
    verdictId: result.insertId,
  };
}

export async function updateJudgeVerdict(
  judgeId: number,
  verdictId: number,
  input: UpdateJudgeVerdictInput
) {
  const judge = await getActiveJudge(judgeId);

  const [verdictRows] = await db.query(
    `
    SELECT id
    FROM court_verdicts
    WHERE id = ?
      AND judge_id = ?
    LIMIT 1
    `,
    [verdictId, judge.id]
  );

  if ((verdictRows as { id: number }[]).length === 0) {
    throw new Error("Verdict not found or not created by you.");
  }

  await ensureCaseAssignedToJudge(judge.id, input.case_id);

  await db.query(
    `
    UPDATE court_verdicts
    SET
      case_id = ?,
      verdict_title = ?,
      decision = ?,
      verdict_summary = ?,
      sentence_text = ?,
      status = ?
    WHERE id = ?
      AND judge_id = ?
    `,
    [
      input.case_id,
      input.verdict_title,
      input.decision,
      input.verdict_summary,
      input.sentence_text,
      input.status,
      verdictId,
      judge.id,
    ]
  );

  if (input.status === "Final") {
    await db.query(
      `
      UPDATE cases
      SET status = 'Closed'
      WHERE id = ?
      `,
      [input.case_id]
    );
  }

  return {
    judge,
    verdictId,
  };
}

export async function deleteJudgeVerdict(judgeId: number, verdictId: number) {
  const judge = await getActiveJudge(judgeId);

  const [result] = await db.query<ResultSetHeader>(
    `
    DELETE FROM court_verdicts
    WHERE id = ?
      AND judge_id = ?
    `,
    [verdictId, judge.id]
  );

  if (result.affectedRows === 0) {
    throw new Error("Verdict not found or not created by you.");
  }

  return {
    judge,
    verdictId,
  };
}