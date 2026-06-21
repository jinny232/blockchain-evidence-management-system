import type { CasePriority, CaseStatus } from "@/models/case.model";
import type { AssignableRole } from "@/models/team-assignment.model";

export interface CaseDetailRecord {
  id: number;
  case_code: string;
  title: string;
  description: string | null;
  priority: CasePriority;
  status: CaseStatus;
  lead_investigator: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseDetailTeamMember {
  id: number;
  user_id: number;
  full_name: string;
  username: string;
  email: string | null;
  role: AssignableRole;
  assigned_by: string | null;
  created_at: string;
}

export interface CaseDetailEvidence {
  id: number;
  evidence_type: string;
  description: string | null;
  file_hash: string | null;
  ipfs_cid: string | null;
  submitted_by: string | null;
  status: string;
  created_at: string;
}

export interface CaseDetailAuditLog {
  id: number;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  status: string;
  details: string | null;
  created_at: string;
}

export interface CaseDetailResponse {
  caseRecord: CaseDetailRecord;
  team: CaseDetailTeamMember[];
  evidence: CaseDetailEvidence[];
  auditLogs: CaseDetailAuditLog[];
}