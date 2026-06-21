import { db } from "@/lib/db";
import type { LabActivityLog } from "@/models/lab-activity.model";

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

export async function getLabActivityLogs(
  technicianId: number
): Promise<LabActivityLog[]> {
  const technician = await getActiveLabTechnician(technicianId);

  const [rows] = await db.query(
    `
    SELECT
      id,
      actor_name,
      actor_role,
      action,
      entity_type,
      entity_id,
      status,
      details,
      ip_address,
      created_at
    FROM audit_logs
    WHERE actor_role = 'Lab Technician'
      AND (
        actor_name IN (?, ?)
        OR details LIKE ?
        OR details LIKE ?
      )
    ORDER BY created_at DESC
    `,
    [
      technician.full_name,
      technician.username,
      `%${technician.full_name}%`,
      `%${technician.username}%`,
    ]
  );

  return rows as LabActivityLog[];
}