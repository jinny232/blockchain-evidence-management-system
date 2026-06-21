export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCases: number;
  openCases: number;
  totalEvidence: number;
  pendingEvidence: number;
  acceptedEvidence: number;
  analyzedEvidence: number;
  totalAuditLogs: number;
}

export interface DashboardRecentCase {
  id: number;
  case_code: string;
  title: string;
  priority: string;
  status: string;
  lead_investigator: string | null;
  created_at: string;
}

export interface DashboardRecentEvidence {
  id: number;
  case_id: number | null;
  evidence_type: string;
  submitted_by: string | null;
  status: string;
  created_at: string;
}

export interface DashboardRecentAuditLog {
  id: number;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  status: string;
  created_at: string;
}

export interface AdminDashboardResponse {
  stats: DashboardStats;
  recentCases: DashboardRecentCase[];
  recentEvidence: DashboardRecentEvidence[];
  recentAuditLogs: DashboardRecentAuditLog[];
}