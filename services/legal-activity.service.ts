import { db } from "@/lib/db";
import type { LegalActivityLog } from "@/models/legal-activity.model";

type LawyerUser = {
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

  const users = rows as LawyerUser[];

  if (users.length === 0) {
    throw new Error("Lawyer account not found.");
  }

  return users[0];
}

export async function getLegalActivityLogs(
  lawyerId: number
): Promise<LegalActivityLog[]> {
  const lawyer = await getActiveLawyer(lawyerId);

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
    WHERE actor_role = 'Lawyer'
      AND (
        actor_name IN (?, ?)
        OR details LIKE ?
        OR details LIKE ?
      )
    ORDER BY created_at DESC
    `,
    [
      lawyer.full_name,
      lawyer.username,
      `%${lawyer.full_name}%`,
      `%${lawyer.username}%`,
    ]
  );

  return rows as LegalActivityLog[];
}