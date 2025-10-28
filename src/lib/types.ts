
export enum UserRole {
  ADMIN = "admin", // Admin of an organization/consorcio
  LAWYER = "lawyer",
  SECRETARY = "secretary",
  CLIENT = "client", // Nuevo rol para clientes finales
}

export const USER_ROLE_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.LAWYER]: "Abogado",
  [UserRole.SECRETARY]: "Secretaria/o",
  [UserRole.CLIENT]: "Cliente",
};

// Represents an organization or "consorcio"
export interface Organization {
  id: string;
  name: string;
  ownerId: string; // User ID of the admin who owns/created this organization
  plan: "trial_basic" | "basic" | "premium" | "enterprise" | "system_admin";
  themePalette?: ThemePaletteId;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  currentStorageUsedBytes?: number;
  maxStorageGB?: number;
}

export interface User {
  id: string; // Firebase UID
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string; // ID of the organization this user belongs to
  // Nuevos campos para perfiles de abogado y cliente
  location?: string; // Ej: "La Paz, Bolivia"
  specialties?: CaseSubject[]; // Para abogados
  bio?: string; // Para abogados
  profilePictureUrl?: string; // Para abogados
  hourlyRateRange?: [number, number]; // Ej: [100, 300] para abogados
}

export enum CaseSubject {
  PENAL = "Penal",
  CIVIL = "Civil",
  FAMILIAR = "Familiar",
  LABORAL = "Laboral",
  ADMINISTRATIVO = "Administrativo",
  COMERCIAL = "Comercial", // Añadido para más variedad
  TRIBUTARIO = "Tributario", // Añadido para más variedad
  OTROS = "Otros",
}

export interface Reminder {
  id: string;
  date: string; // ISO date string
  message: string;
  createdBy: string; // User ID
}

export interface FileAttachment {
  id: string;
  fileName: string; // Original name of the uploaded file
  gcsPath: string; // Simulated GCS path, e.g., "tenants/orgId/casos/caseId/fileName.pdf"
  contentType: string; // MIME type of the file
  size?: number; // Size in bytes
  uploadedAt: string; // ISO date string
}

export interface Case {
  id: string;
  nurej: string;
  clientName: string; // En el futuro, podría ser un clientId
  cause: string;
  processStage: string;
  nextActivity: string;
  subject: CaseSubject;
  assignedLawyerId?: string; // User ID of the lawyer
  lastActivityDate: string; // ISO date string
  reminders: Reminder[];
  fileAttachments: FileAttachment[];
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

export const PLAN_LIMITS: Record<Organization['plan'], { maxTeamMembers: number, maxStorageGB: number }> = {
  trial_basic: { maxTeamMembers: 2, maxStorageGB: 1 },
  basic: { maxTeamMembers: 5, maxStorageGB: 15 },
  premium: { maxTeamMembers: 20, maxStorageGB: 50 },
  enterprise: { maxTeamMembers: Infinity, maxStorageGB: Infinity },
  system_admin: { maxTeamMembers: Infinity, maxStorageGB: Infinity },
};


export const THEME_PALETTES = [
  { id: "default", name: "YASI K'ARI Corporativo" },
  { id: "ocean-blue", name: "Azul Océano Corporativo" },
  { id: "forest-green", name: "Verde Bosque Sereno" },
  { id: "crimson-red", name: "Rojo Carmesí Elegante" },
  { id: "golden-sand", name: "Arena Dorada Clásica" },
  { id: "lavender-mist", name: "Niebla Lavanda Moderna" },
] as const;

export type ThemePaletteId = typeof THEME_PALETTES[number]['id'];

