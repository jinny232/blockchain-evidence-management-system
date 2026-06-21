import { createAuditLog } from "@/services/audit-log.service";

type AuditStatus = "Success" | "Warning" | "Failed" | "Critical";

export function getRequestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function recordAuditLog(data: {
  actor_name?: string | null;
  actor_role?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  status?: AuditStatus;
  details?: string | null;
  ip_address?: string | null;
}) {
  try {
    await createAuditLog({
      actor_name: data.actor_name || "Admin",
      actor_role: data.actor_role || "Admin",
      action: data.action,
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      status: data.status || "Success",
      details: data.details || null,
      ip_address: data.ip_address || null,
    });
  } catch (error) {
    console.error("AUDIT LOG WRITE ERROR:", error);
  }
}