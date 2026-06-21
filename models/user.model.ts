export type UserRole =
  | "Admin"
  | "Investigator"
  | "Lab Technician"
  | "Lawyer"
  | "Judge";

export type User = {
  id: number;
  fullName: string;
  username: string;
  email: string | null;
  role: UserRole;
  active: boolean;
};