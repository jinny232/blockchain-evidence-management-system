export interface LegalCaseItem {
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
  analyzed_evidence_count: number;
  lab_report_count: number;
}

export interface LegalCaseTeamMember {
  id: number;
  user_id: number;
  full_name: string;
  username: string;
  email: string | null;
  role: string;
  assigned_by: string | null;
  created_at: string;
}

export interface LegalCaseEvidence {
  id: number;
  case_id: number | null;
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

export interface LegalCaseLabReport {
  id: number;
  evidence_id: number;
  analyzed_by: string;
  analysis_type: string | null;
  result: string;
  conclusion: string | null;
  attachment_name: string | null;
  attachment_mime_type: string | null;
  attachment_size: number | null;
  attachment_hash: string | null;
  attachment_ipfs_cid: string | null;
  created_at: string;
  evidence_type: string;
  file_hash: string;
}

export interface LegalCaseDetails extends LegalCaseItem {
  team: LegalCaseTeamMember[];
  evidence: LegalCaseEvidence[];
  labReports: LegalCaseLabReport[];
}