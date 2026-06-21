import { db } from "@/lib/db";
import type { EvidenceRecord } from "@/models/evidence.model";

export async function getEvidenceRecords() {
  const [rows] = await db.query(
    `
    SELECT
      id,
      case_id,
      submitted_by,
      NULL AS user_role,
      evidence_type,
      description,
      file_hash,
      ipfs_cid,
      status,
      created_at
    FROM evidence
    ORDER BY created_at DESC
    `
  );

  return rows as EvidenceRecord[];
}

export async function getEvidenceById(id: string) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      case_id,
      submitted_by,
      NULL AS user_role,
      evidence_type,
      description,
      file_hash,
      ipfs_cid,
      status,
      created_at
    FROM evidence
    WHERE id = ?
    `,
    [id]
  );

  const evidence = rows as EvidenceRecord[];
  return evidence[0] || null;
}