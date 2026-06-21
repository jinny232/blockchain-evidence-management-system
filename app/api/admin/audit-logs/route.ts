import { handleGetAuditLogs } from "@/controllers/audit-log.controller";

export async function GET() {
  return handleGetAuditLogs();
}