import { db } from "@/lib/db";
import type { JudgeActivityLog } from "@/models/judge-activity.model";

type JudgeUser = {
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

  const users = rows as JudgeUser[];

  if (users.length === 0) {
    throw new Error("Judge account not found.");
  }

  return users[0];
}

export async function getJudgeActivityLogs(
  judgeId: number
): Promise<JudgeActivityLog[]> {
  const judge = await getActiveJudge(judgeId);

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
    WHERE actor_role = 'Judge'
      AND (
        actor_name IN (?, ?)
        OR details LIKE ?
        OR details LIKE ?
      )
    ORDER BY created_at DESC
    `,
    [
      judge.full_name,
      judge.username,
      `%${judge.full_name}%`,
      `%${judge.username}%`,
    ]
  );

  return rows as JudgeActivityLog[];
}