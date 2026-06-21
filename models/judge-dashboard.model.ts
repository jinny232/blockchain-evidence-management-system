export interface JudgeUserInfo {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
}

export interface JudgeDashboardStats {
  assignedCases: number;
  openCases: number;
  inProgressCases: number;
  closedCases: number;
  totalEvidence: number;
  analyzedEvidence: number;
  totalLabReports: number;
  finalLegalNotes: number;
}

export interface JudgeAssignedCase {
  id: number;
  case_code: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  lead_investigator: string | null;
  created_at: string;
  evidence_count: number;
  analyzed_evidence_count: number;
  lab_report_count: number;
  final_note_count: number;
}

export interface JudgeRecentEvidence {
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

export interface JudgeRecentLabReport {
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

export interface JudgeRecentLegalNote {
  id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_id: number | null;
  note_type: string;
  title: string;
  status: string;
  updated_at: string;
  lawyer_name: string | null;
}

export interface JudgeDashboardResponse {
  judge: JudgeUserInfo;
  stats: JudgeDashboardStats;
  assignedCases: JudgeAssignedCase[];
  recentEvidence: JudgeRecentEvidence[];
  recentLabReports: JudgeRecentLabReport[];
  recentLegalNotes: JudgeRecentLegalNote[];
}