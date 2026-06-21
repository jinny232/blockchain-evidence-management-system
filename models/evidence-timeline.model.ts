export type EvidenceTimelineItemType =
  | "Submitted"
  | "Blockchain"
  | "Accepted"
  | "Analyzed"
  | "Audit"
  | "Updated";

export interface EvidenceTimelineItem {
  id: string;
  type: EvidenceTimelineItemType;
  title: string;
  description: string;
  actor_name: string | null;
  actor_role: string | null;
  status: string;
  created_at: string;
  metadata?: {
    file_hash?: string | null;
    ipfs_cid?: string | null;
    blockchain_tx_hash?: string | null;
    blockchain_status?: string | null;
    analysis_type?: string | null;
    conclusion?: string | null;
    ip_address?: string | null;
  };
}

export interface EvidenceTimelineResponse {
  evidence_id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_type: string;
  current_status: string;
  timeline: EvidenceTimelineItem[];
}