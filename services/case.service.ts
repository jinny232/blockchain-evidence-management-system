import { z } from "zod";
import { db } from "@/lib/db";
import type { CaseRecord } from "@/models/case.model";

export const caseSchema = z.object({
  case_code: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  status: z.enum(["Open", "In Progress", "Closed"]),
  lead_investigator: z.string().optional().nullable(),
});

export async function getCases() {
  const [rows] = await db.query("SELECT * FROM cases ORDER BY created_at DESC");
  return rows as CaseRecord[];
}

export async function createCase(data: unknown) {
  const parsed = caseSchema.parse(data);

  await db.query(
    `INSERT INTO cases 
    (case_code, title, description, priority, status, lead_investigator)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      parsed.case_code,
      parsed.title,
      parsed.description || null,
      parsed.priority,
      parsed.status,
      parsed.lead_investigator || null,
    ]
  );
}

export async function updateCase(id: string, data: unknown) {
  const parsed = caseSchema.parse(data);

  await db.query(
    `UPDATE cases
     SET case_code = ?, title = ?, description = ?, priority = ?, status = ?, lead_investigator = ?
     WHERE id = ?`,
    [
      parsed.case_code,
      parsed.title,
      parsed.description || null,
      parsed.priority,
      parsed.status,
      parsed.lead_investigator || null,
      id,
    ]
  );
}

export async function deleteCase(id: string) {
  await db.query("DELETE FROM cases WHERE id = ?", [id]);
}