export interface JudgeEvidenceItem {
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
  updated_at: string;
  lab_report_count: number;
  latest_conclusion: string | null;
}

export interface JudgeEvidenceLabReport {
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
}

export interface JudgeEvidenceDetails extends JudgeEvidenceItem {
  reports: JudgeEvidenceLabReport[];
}