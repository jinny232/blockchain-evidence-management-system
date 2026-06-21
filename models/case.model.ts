export type CasePriority = "Low" | "Medium" | "High" | "Urgent";
export type CaseStatus = "Open" | "In Progress" | "Closed";

export interface CaseRecord {
  id: number;
  case_code: string;
  title: string;
  description: string | null;
  priority: CasePriority;
  status: CaseStatus;
  lead_investigator: string | null;
  created_at: string;
  updated_at: string;
}