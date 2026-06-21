import { db } from "@/lib/db";
import type { AuditLogRecord } from "@/models/audit-log.model";

export async function getAuditLogs() {
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
    ORDER BY created_at DESC
    `
  );

  return rows as AuditLogRecord[];
}

export async function createAuditLog(data: {
  actor_name?: string | null;
  actor_role?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  status?: "Success" | "Warning" | "Failed" | "Critical";
  details?: string | null;
  ip_address?: string | null;
}) {
  await db.query(
    `
    INSERT INTO audit_logs
    (actor_name, actor_role, action, entity_type, entity_id, status, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.actor_name || null,
      data.actor_role || null,
      data.action,
      data.entity_type || null,
      data.entity_id || null,
      data.status || "Success",
      data.details || null,
      data.ip_address || null,
    ]
  );
}