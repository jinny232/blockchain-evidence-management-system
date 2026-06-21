export type InvestigatorEvidenceType =
  | "Image"
  | "Document"
  | "Video"
  | "Audio"
  | "Disk Image"
  | "Network Log"
  | "Other";

export type InvestigatorEvidenceStatus =
  | "Pending"
  | "Accepted"
  | "Analyzed"
  | "Rejected";

export interface InvestigatorEvidenceListItem {
  id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_type: InvestigatorEvidenceType;
  description: string | null;
  file_hash: string;
  ipfs_cid: string | null;
  submitted_by: string | null;
  status: InvestigatorEvidenceStatus;
  created_at: string;
  updated_at: string;
  blockchain_tx_hash: string | null;
  blockchain_status: string | null;
}

export interface InvestigatorEvidenceDetails extends InvestigatorEvidenceListItem {}

export interface SubmittedEvidenceReceipt {
  id: number;
  case_id: number;
  case_code: string;
  case_title: string;
  evidence_type: InvestigatorEvidenceType;
  description: string | null;
  file_hash: string;
  ipfs_cid: string | null;
  submitted_by: string;
  status: InvestigatorEvidenceStatus;
  created_at: string;
  blockchain_tx_hash: string | null;
  blockchain_status: string | null;
}