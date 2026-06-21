import { db } from "@/lib/db";
import type { LabReportItem } from "@/models/lab-report.model";

type LabTechnicianUser = {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
};

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

  const users = rows as LabTechnicianUser[];

  if (users.length === 0) {
    throw new Error("Lab technician account not found.");
  }

  return users[0];
}

export async function getLabReports(
  technicianId: number
): Promise<LabReportItem[]> {
  const technician = await getActiveLabTechnician(technicianId);

  const [rows] = await db.query(
    `
    SELECT
      lr.id,
      lr.evidence_id,
      lr.analyzed_by,
      lr.analysis_type,
      lr.result,
      lr.conclusion,
      lr.created_at,

      e.case_id,
      c.case_code,
      c.title AS case_title,

      e.evidence_type,
      e.status AS evidence_status,
      e.submitted_by,
      e.file_hash,
      e.ipfs_cid,
      e.blockchain_tx_hash,
      e.blockchain_status
    FROM lab_results lr
    INNER JOIN evidence e
      ON e.id = lr.evidence_id
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE cta.user_id = ?
      AND cta.role = 'Lab Technician'
      AND lr.analyzed_by IN (?, ?)
    ORDER BY lr.created_at DESC
    `,
    [technician.id, technician.full_name, technician.username]
  );

  return rows as LabReportItem[];
}