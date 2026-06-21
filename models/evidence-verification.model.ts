export type EvidenceVerificationStatus =
  | "Verified"
  | "Matched"
  | "Not Found";

export interface EvidenceVerificationMatch {
  id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_type: string;
  description: string | null;
  file_hash: string;
  ipfs_cid: string | null;
  submitted_by: string | null;
  evidence_status: string;
  blockchain_tx_hash: string | null;
  blockchain_status: string | null;
  created_at: string;
  updated_at: string | null;
  latest_conclusion: string | null;
  report_count: number;
}

export interface EvidenceVerificationResponse {
  input_hash: string;
  status: EvidenceVerificationStatus;
  verified: boolean;
  matched: boolean;
  message: string;
  matches: EvidenceVerificationMatch[];
}