export type InvestigatorTeamRole =
  | "Investigator"
  | "Lab Technician"
  | "Lawyer"
  | "Judge";

export interface InvestigatorCaseListItem {
  id: number;
  case_code: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  lead_investigator: string | null;
  created_at: string;
  updated_at: string;
  evidence_count: number;
  team_count: number;
}

export interface InvestigatorCaseTeamMember {
  id: number;
  user_id: number;
  full_name: string;
  username: string;
  email: string | null;
  role: InvestigatorTeamRole;
  assigned_by: string | null;
  created_at: string;
}

export interface InvestigatorCaseEvidence {
  id: number;
  case_id: number | null;
  evidence_type: string;
  description: string | null;
  file_hash: string | null;
  ipfs_cid: string | null;
  submitted_by: string | null;
  status: string;
  created_at: string;
}

export interface InvestigatorCaseAuditLog {
  id: number;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  status: string;
  details: string | null;
  created_at: string;
}

export interface InvestigatorCaseDetailResponse {
  caseRecord: InvestigatorCaseListItem;
  team: InvestigatorCaseTeamMember[];
  evidence: InvestigatorCaseEvidence[];
  auditLogs: InvestigatorCaseAuditLog[];
}