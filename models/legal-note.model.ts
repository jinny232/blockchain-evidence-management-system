export type LegalNoteType =
  | "Case Opinion"
  | "Evidence Remark"
  | "Court Preparation"
  | "Objection"
  | "Other";

export type LegalNoteStatus = "Draft" | "Final" | "Archived";

export interface LegalNote {
  id: number;
  lawyer_id: number;
  lawyer_name: string | null;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_id: number | null;
  evidence_type: string | null;
  evidence_hash: string | null;
  note_type: LegalNoteType;
  title: string;
  content: string;
  recommendation: string | null;
  status: LegalNoteStatus;
  created_at: string;
  updated_at: string;
}

export interface LegalNoteCaseOption {
  id: number;
  case_code: string;
  title: string;
}

export interface LegalNoteEvidenceOption {
  id: number;
  case_id: number;
  case_code: string;
  case_title: string;
  evidence_type: string;
  status: string;
  file_hash: string;
}

export interface LegalNotesResponse {
  notes: LegalNote[];
  cases: LegalNoteCaseOption[];
  evidence: LegalNoteEvidenceOption[];
}

export interface CreateLegalNoteInput {
  case_id: number;
  evidence_id: number | null;
  note_type: LegalNoteType;
  title: string;
  content: string;
  recommendation: string | null;
  status: LegalNoteStatus;
}

export interface UpdateLegalNoteInput extends CreateLegalNoteInput {}