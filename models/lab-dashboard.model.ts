export interface LabTechnicianInfo {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
}

export interface LabDashboardStats {
  assignedCases: number;
  pendingEvidence: number;
  acceptedEvidence: number;
  analyzedEvidence: number;
  rejectedEvidence: number;
  totalReports: number;
}

export interface LabRecentEvidence {
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

export interface LabRecentReport {
  id: number;
  evidence_id: number;
  analyzed_by: string;
  analysis_type: string | null;
  conclusion: string | null;
  created_at: string;
}

export interface LabDashboardResponse {
  technician: LabTechnicianInfo;
  stats: LabDashboardStats;
  recentEvidence: LabRecentEvidence[];
  recentReports: LabRecentReport[];
}