export type JudgeVerdictDecision =
  | "Guilty"
  | "Not Guilty"
  | "Dismissed"
  | "Pending Further Review"
  | "Other";

export type JudgeVerdictStatus = "Draft" | "Final" | "Archived";

export interface JudgeVerdict {
  id: number;
  judge_id: number;
  judge_name: string | null;
  case_id: number;
  case_code: string;
  case_title: string;
  verdict_title: string;
  decision: JudgeVerdictDecision;
  verdict_summary: string;
  sentence_text: string | null;
  status: JudgeVerdictStatus;
  created_at: string;
  updated_at: string;
}

export interface JudgeVerdictCaseOption {
  id: number;
  case_code: string;
  title: string;
  status: string;
  evidence_count: number;
  lab_report_count: number;
  legal_note_count: number;
}

export interface JudgeVerdictsResponse {
  verdicts: JudgeVerdict[];
  cases: JudgeVerdictCaseOption[];
}

export interface CreateJudgeVerdictInput {
  case_id: number;
  verdict_title: string;
  decision: JudgeVerdictDecision;
  verdict_summary: string;
  sentence_text: string | null;
  status: JudgeVerdictStatus;
}

export interface UpdateJudgeVerdictInput extends CreateJudgeVerdictInput {}