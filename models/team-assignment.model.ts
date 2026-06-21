export type AssignableRole =
  | "Investigator"
  | "Lab Technician"
  | "Lawyer"
  | "Judge";

export interface TeamAssignmentRecord {
  id: number;
  case_id: number;
  case_code: string;
  case_title: string;
  user_id: number;
  full_name: string;
  username: string;
  email: string | null;
  role: AssignableRole;
  assigned_by: string | null;
  created_at: string;
}

export interface TeamCaseOption {
  id: number;
  case_code: string;
  title: string;
}

export interface TeamUserOption {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
  role: AssignableRole;
}