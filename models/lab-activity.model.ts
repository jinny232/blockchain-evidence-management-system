export type LabActivityStatus =
  | "Success"
  | "Warning"
  | "Failed"
  | "Critical";

export interface LabActivityLog {
  id: number;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  status: LabActivityStatus;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}