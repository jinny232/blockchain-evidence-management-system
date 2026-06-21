import { db } from "@/lib/db";
import type {
  TeamAssignmentRecord,
  TeamCaseOption,
  TeamUserOption,
} from "@/models/team-assignment.model";

export async function getTeamAssignmentData() {
  const [assignments] = await db.query(
    `
    SELECT
      cta.id,
      cta.case_id,
      c.case_code,
      c.title AS case_title,
      cta.user_id,
      u.full_name,
      u.username,
      u.email,
      cta.role,
      cta.assigned_by,
      cta.created_at
    FROM case_team_assignments cta
    INNER JOIN cases c ON c.id = cta.case_id
    INNER JOIN users u ON u.id = cta.user_id
    ORDER BY c.created_at DESC, cta.role, u.full_name
    `
  );

  const [cases] = await db.query(
    `
    SELECT id, case_code, title
    FROM cases
    ORDER BY created_at DESC
    `
  );

  const [users] = await db.query(
    `
    SELECT id, full_name, username, email, role
    FROM users
    WHERE role IN ('Investigator', 'Lab Technician', 'Lawyer', 'Judge')
    AND active = 1
    ORDER BY role, full_name
    `
  );

  return {
    assignments: assignments as TeamAssignmentRecord[],
    cases: cases as TeamCaseOption[],
    users: users as TeamUserOption[],
  };
}

export async function updateCaseTeam(data: {
  case_id: number;
  assignments: Array<{
    user_id: number;
    role: string;
  }>;
  assigned_by?: string | null;
}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM case_team_assignments WHERE case_id = ?",
      [data.case_id]
    );

    if (data.assignments.length > 0) {
      const values = data.assignments.map((item) => [
        data.case_id,
        item.user_id,
        item.role,
        data.assigned_by || "Admin",
      ]);

      await connection.query(
        `
        INSERT INTO case_team_assignments
        (case_id, user_id, role, assigned_by)
        VALUES ?
        `,
        [values]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteTeamAssignment(id: string) {
  await db.query("DELETE FROM case_team_assignments WHERE id = ?", [id]);
}