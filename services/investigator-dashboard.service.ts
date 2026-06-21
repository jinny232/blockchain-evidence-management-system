import { db } from "@/lib/db";
import type {
  InvestigatorDashboardResponse,
  InvestigatorInfo,
  InvestigatorRecentActivity,
  InvestigatorRecentCase,
  InvestigatorRecentEvidence,
} from "@/models/investigator-dashboard.model";

type CountRow = {
  count: number;
};

async function countQuery(sql: string, params: unknown[] = []) {
  const [rows] = await db.query(sql, params);
  const result = rows as CountRow[];

  return Number(result[0]?.count || 0);
}

export async function getInvestigatorDashboardData(
  investigatorId: number
): Promise<InvestigatorDashboardResponse> {
  const [userRows] = await db.query(
    `
    SELECT id, full_name, username, email
    FROM users
    WHERE id = ?
      AND role = 'Investigator'
      AND active = 1
    LIMIT 1
    `,
    [investigatorId]
  );

  const users = userRows as InvestigatorInfo[];

  if (users.length === 0) {
    throw new Error("Investigator account not found.");
  }

  const investigator = users[0];

  const submittedByValues = [investigator.full_name, investigator.username];

  const [
    assignedCases,
    openCases,
    submittedEvidence,
    pendingEvidence,
    acceptedEvidence,
    analyzedEvidence,
    rejectedEvidence,
  ] = await Promise.all([
    countQuery(
      `
      SELECT COUNT(DISTINCT c.id) AS count
      FROM cases c
      INNER JOIN case_team_assignments cta ON cta.case_id = c.id
      WHERE cta.user_id = ?
        AND cta.role = 'Investigator'
      `,
      [investigator.id]
    ),

    countQuery(
      `
      SELECT COUNT(DISTINCT c.id) AS count
      FROM cases c
      INNER JOIN case_team_assignments cta ON cta.case_id = c.id
      WHERE cta.user_id = ?
        AND cta.role = 'Investigator'
        AND c.status = 'Open'
      `,
      [investigator.id]
    ),

    countQuery(
      `
      SELECT COUNT(*) AS count
      FROM evidence
      WHERE submitted_by IN (?, ?)
      `,
      submittedByValues
    ),

    countQuery(
      `
      SELECT COUNT(*) AS count
      FROM evidence
      WHERE submitted_by IN (?, ?)
        AND status = 'Pending'
      `,
      submittedByValues
    ),

    countQuery(
      `
      SELECT COUNT(*) AS count
      FROM evidence
      WHERE submitted_by IN (?, ?)
        AND status = 'Accepted'
      `,
      submittedByValues
    ),

    countQuery(
      `
      SELECT COUNT(*) AS count
      FROM evidence
      WHERE submitted_by IN (?, ?)
        AND status = 'Analyzed'
      `,
      submittedByValues
    ),

    countQuery(
      `
      SELECT COUNT(*) AS count
      FROM evidence
      WHERE submitted_by IN (?, ?)
        AND status = 'Rejected'
      `,
      submittedByValues
    ),
  ]);

  const [caseRows] = await db.query(
    `
    SELECT DISTINCT
      c.id,
      c.case_code,
      c.title,
      c.priority,
      c.status,
      c.lead_investigator,
      c.created_at
    FROM cases c
    INNER JOIN case_team_assignments cta ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Investigator'
    ORDER BY c.created_at DESC
    LIMIT 5
    `,
    [investigator.id]
  );

  const [evidenceRows] = await db.query(
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
      e.status,
      e.created_at
    FROM evidence e
    LEFT JOIN cases c ON c.id = e.case_id
    WHERE e.submitted_by IN (?, ?)
    ORDER BY e.created_at DESC
    LIMIT 5
    `,
    submittedByValues
  );

  const [activityRows] = await db.query(
    `
    SELECT
      id,
      action,
      entity_type,
      entity_id,
      status,
      details,
      created_at
    FROM audit_logs
    WHERE actor_name IN (?, ?)
       OR details LIKE ?
       OR details LIKE ?
    ORDER BY created_at DESC
    LIMIT 5
    `,
    [
      investigator.full_name,
      investigator.username,
      `%${investigator.full_name}%`,
      `%${investigator.username}%`,
    ]
  );

  return {
    investigator,
    stats: {
      assignedCases,
      openCases,
      submittedEvidence,
      pendingEvidence,
      acceptedEvidence,
      analyzedEvidence,
      rejectedEvidence,
    },
    recentCases: caseRows as InvestigatorRecentCase[],
    recentEvidence: evidenceRows as InvestigatorRecentEvidence[],
    recentActivity: activityRows as InvestigatorRecentActivity[],
  };
}