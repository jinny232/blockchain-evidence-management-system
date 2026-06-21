export interface LegalUserInfo {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
}

export interface LegalDashboardStats {
  assignedCases: number;
  openCases: number;
  inProgressCases: number;
  closedCases: number;
  totalEvidence: number;
  analyzedEvidence: number;
  totalLabReports: number;
}

export interface LegalAssignedCase {
  id: number;
  case_code: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  lead_investigator: string | null;
  created_at: string;
  evidence_count: number;
  lab_report_count: number;
}

export interface LegalRecentEvidence {
  id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_type: string;
  description: string | null;
  file_hash: string;
  ipfs_cid: string | null;
  submitted_by: string | null;
  status: string;
  blockchain_tx_hash: string | null;
  blockchain_status: string | null;
  created_at: string;
}

export interface LegalRecentLabReport {
  id: number;
  evidence_id: number;
  analyzed_by: string;
  analysis_type: string | null;
  conclusion: string | null;
  created_at: string;
  case_code: string | null;
  case_title: string | null;
  evidence_type: string;
}

export interface LegalDashboardResponse {
  lawyer: LegalUserInfo;
  stats: LegalDashboardStats;
  assignedCases: LegalAssignedCase[];
  recentEvidence: LegalRecentEvidence[];
  recentLabReports: LegalRecentLabReport[];
}