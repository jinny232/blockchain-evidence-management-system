export interface LabReportItem {
  id: number;
  evidence_id: number;
  analyzed_by: string;
  analysis_type: string | null;
  result: string;
  conclusion: string | null;
  created_at: string;

  case_id: number | null;
  case_code: string | null;
  case_title: string | null;

  evidence_type: string;
  evidence_status: string;
  submitted_by: string | null;
  file_hash: string;
  ipfs_cid: string | null;
  blockchain_tx_hash: string | null;
  blockchain_status: string | null;
}