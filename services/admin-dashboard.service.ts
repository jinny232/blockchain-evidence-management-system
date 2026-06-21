import { db } from "@/lib/db";
import type {
  AdminDashboardResponse,
  DashboardRecentAuditLog,
  DashboardRecentCase,
  DashboardRecentEvidence,
} from "@/models/admin-dashboard.model";

type CountRow = {
  count: number;
};

async function countQuery(sql: string, params: unknown[] = []) {
  const [rows] = await db.query(sql, params);
  const result = rows as CountRow[];

  return Number(result[0]?.count || 0);
}

export async function getAdminDashboardData(): Promise<AdminDashboardResponse> {
  const [
    totalUsers,
    activeUsers,
    totalCases,
    openCases,
    totalEvidence,
    pendingEvidence,
    acceptedEvidence,
    analyzedEvidence,
    totalAuditLogs,
  ] = await Promise.all([
    countQuery("SELECT COUNT(*) AS count FROM users"),
    countQuery("SELECT COUNT(*) AS count FROM users WHERE active = 1"),
    countQuery("SELECT COUNT(*) AS count FROM cases"),
    countQuery("SELECT COUNT(*) AS count FROM cases WHERE status = 'Open'"),
    countQuery("SELECT COUNT(*) AS count FROM evidence"),
    countQuery("SELECT COUNT(*) AS count FROM evidence WHERE status = 'Pending'"),
    countQuery("SELECT COUNT(*) AS count FROM evidence WHERE status = 'Accepted'"),
    countQuery("SELECT COUNT(*) AS count FROM evidence WHERE status = 'Analyzed'"),
    countQuery("SELECT COUNT(*) AS count FROM audit_logs"),
  ]);

  const [caseRows] = await db.query(
    `
    SELECT
      id,
      case_code,
      title,
      priority,
      status,
      lead_investigator,
      created_at
    FROM cases
    ORDER BY created_at DESC
    LIMIT 5
    `
  );

  const [evidenceRows] = await db.query(
    `
    SELECT
      id,
      case_id,
      evidence_type,
      submitted_by,
      status,
      created_at
    FROM evidence
    ORDER BY created_at DESC
    LIMIT 5
    `
  );

  const [auditRows] = await db.query(
    `
    SELECT
      id,
      actor_name,
      actor_role,
      action,
      status,
      created_at
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 5
    `
  );

  return {
    stats: {
      totalUsers,
      activeUsers,
      totalCases,
      openCases,
      totalEvidence,
      pendingEvidence,
      acceptedEvidence,
      analyzedEvidence,
      totalAuditLogs,
    },
    recentCases: caseRows as DashboardRecentCase[],
    recentEvidence: evidenceRows as DashboardRecentEvidence[],
    recentAuditLogs: auditRows as DashboardRecentAuditLog[],
  };
}