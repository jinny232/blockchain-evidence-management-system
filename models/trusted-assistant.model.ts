export type TrustedAssistantCardType =
  | "case"
  | "evidence"
  | "team"
  | "lab_report"
  | "verdict"
  | "help";

export interface TrustedAssistantAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "success" | "warning";
}

export interface TrustedAssistantCard {
  type: TrustedAssistantCardType;
  title: string;
  subtitle?: string;
  description?: string;
  status?: string | null;
  metadata?: {
    label: string;
    value: string;
  }[];
  actions: TrustedAssistantAction[];
}

export interface TrustedAssistantResponse {
  answer: string;
  cards: TrustedAssistantCard[];
  suggestions: string[];
}