export interface InvestigatorInfo {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
}

export interface InvestigatorDashboardStats {
  assignedCases: number;
  openCases: number;
  submittedEvidence: number;
  pendingEvidence: number;
  acceptedEvidence: number;
  analyzedEvidence: number;
  rejectedEvidence: number;
}

export interface InvestigatorRecentCase {
  id: number;
  case_code: string;
  title: string;
  priority: string;
  status: string;
  lead_investigator: string | null;
  created_at: string;
}

export interface InvestigatorRecentEvidence {
  id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_type: string;
  description: string | null;
  file_hash: string | null;
  ipfs_cid: string | null;
  status: string;
  created_at: string;
}

export interface InvestigatorRecentActivity {
  id: number;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  details: string | null;
  created_at: string;
}

export interface InvestigatorDashboardResponse {
  investigator: InvestigatorInfo;
  stats: InvestigatorDashboardStats;
  recentCases: InvestigatorRecentCase[];
  recentEvidence: InvestigatorRecentEvidence[];
  recentActivity: InvestigatorRecentActivity[];
}