import { db } from "@/lib/db";
import type { InvestigatorActivityLog } from "@/models/investigator-activity.model";

type InvestigatorUser = {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
};

async function getActiveInvestigator(investigatorId: number) {
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

  const users = userRows as InvestigatorUser[];

  if (users.length === 0) {
    throw new Error("Investigator account not found.");
  }

  return users[0];
}

export async function getInvestigatorActivityLogs(
  investigatorId: number
): Promise<InvestigatorActivityLog[]> {
  const investigator = await getActiveInvestigator(investigatorId);

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
    WHERE
      actor_name IN (?, ?)
      OR details LIKE ?
      OR details LIKE ?
    ORDER BY created_at DESC
    `,
    [
      investigator.full_name,
      investigator.username,
      `%${investigator.full_name}%`,
      `%${investigator.username}%`,
    ]
  );

  return rows as InvestigatorActivityLog[];
}