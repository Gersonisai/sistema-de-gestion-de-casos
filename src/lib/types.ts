
export enum UserRole {
  ADMIN = "admin", // Admin of an organization/consorcio
  LAWYER = "lawyer",
  // Could add SUPER_ADMIN for platform-level administration later
}

// Represents an organization or "consorcio"
export interface Organization {
  id: string;
  name: string;
  ownerId: string; // User ID of the admin who owns/created this organization
  plan: "trial_basic" | "basic" | "premium" | "enterprise" | "system_admin"; // e.g., "basic", "premium", "trial_basic"
  maxLawyers?: number; // Max lawyers allowed for this org's plan (optional, could be derived from plan)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Potentially other settings like logo, custom color, etc.
}

export interface User {
  id: string; // Firebase UID
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string; // ID of the organization this user belongs to
}

export enum CaseSubject {
  PENAL = "Penal",
  CIVIL = "Civil",
  FAMILIAR = "Familiar",
  LABORAL = "Laboral",
  ADMINISTRATIVO = "Administrativo",
  OTROS = "Otros",
}

export interface Reminder {
  id: string;
  date: string; // ISO date string
  message: string;
  createdBy: string; // User ID
  // organizationId?: string; // To scope reminders per organization
}

export interface DocumentLink {
  id: string;
  name: string;
  url: string; // OneDrive URL
  // organizationId?: string; // To scope documents per organization
}

export interface Case {
  id: string;
  nurej: string;
  clientName: string;
  cause: string;
  processStage: string;
  nextActivity: string;
  subject: CaseSubject;
  assignedLawyerId?: string; // User ID of the lawyer
  lastActivityDate: string; // ISO date string
  reminders: Reminder[];
  documentLinks: DocumentLink[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  organizationId?: string; // ID of the organization this case belongs to
}

export const PROCESS_STAGES = [
  "Investigación Preliminar",
  "Etapa Preparatoria",
  "Juicio Oral",
  "Apelación",
  "Ejecución de Sentencia",
  "Archivado",
];

export const CASE_SUBJECTS_OPTIONS = Object.values(CaseSubject);

export const PLAN_LIMITS: Record<Organization['plan'], { maxLawyers: number }> = {
  trial_basic: { maxLawyers: 2 }, // Example: Trial allows 2 lawyers
  basic: { maxLawyers: 5 },
  premium: { maxLawyers: 20 },
  enterprise: { maxLawyers: Infinity }, // Or a very large number
  system_admin: { maxLawyers: Infinity }, // System admin's org has no limits
};
