import { db } from "@/lib/db";
import type {
  LabDashboardResponse,
  LabRecentEvidence,
  LabRecentReport,
  LabTechnicianInfo,
} from "@/models/lab-dashboard.model";

async function getActiveLabTechnician(technicianId: number) {
  const [rows] = await db.query(
    `
    SELECT id, full_name, username, email
    FROM users
    WHERE id = ?
      AND role = 'Lab Technician'
      AND active = 1
    LIMIT 1
    `,
    [technicianId]
  );

  const users = rows as LabTechnicianInfo[];

  if (users.length === 0) {
    throw new Error("Lab technician account not found.");
  }

  return users[0];
}

export async function getLabDashboardData(
  technicianId: number
): Promise<LabDashboardResponse> {
  const technician = await getActiveLabTechnician(technicianId);

  const [assignedCaseRows] = await db.query(
    `
    SELECT COUNT(DISTINCT c.id) AS total
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Lab Technician'
    `,
    [technician.id]
  );

  const assignedCases = Number(
    (assignedCaseRows as { total: number }[])[0]?.total || 0
  );

  const [statusRows] = await db.query(
    `
    SELECT
      e.status,
      COUNT(*) AS total
    FROM evidence e
    INNER JOIN case_team_assignments cta
      ON cta.case_id = e.case_id
    WHERE cta.user_id = ?
      AND cta.role = 'Lab Technician'
    GROUP BY e.status
    `,
    [technician.id]
  );

  const statusCounts = {
    Pending: 0,
    Accepted: 0,
    Analyzed: 0,
    Rejected: 0,
  };

  (statusRows as { status: keyof typeof statusCounts; total: number }[]).forEach(
    (row) => {
      if (row.status in statusCounts) {
        statusCounts[row.status] = Number(row.total || 0);
      }
    }
  );

  const [reportRows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM lab_results
    WHERE analyzed_by IN (?, ?)
    `,
    [technician.full_name, technician.username]
  );

  const totalReports = Number((reportRows as { total: number }[])[0]?.total || 0);

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
      AND cta.role = 'Lab Technician'
    ORDER BY e.created_at DESC
    LIMIT 8
    `,
    [technician.id]
  );

  const [recentReportRows] = await db.query(
    `
    SELECT
      id,
      evidence_id,
      analyzed_by,
      analysis_type,
      conclusion,
      created_at
    FROM lab_results
    WHERE analyzed_by IN (?, ?)
    ORDER BY created_at DESC
    LIMIT 5
    `,
    [technician.full_name, technician.username]
  );

  return {
    technician,
    stats: {
      assignedCases,
      pendingEvidence: statusCounts.Pending,
      acceptedEvidence: statusCounts.Accepted,
      analyzedEvidence: statusCounts.Analyzed,
      rejectedEvidence: statusCounts.Rejected,
      totalReports,
    },
    recentEvidence: recentEvidenceRows as LabRecentEvidence[],
    recentReports: recentReportRows as LabRecentReport[],
  };
}