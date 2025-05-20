
export enum UserRole {
  ADMIN = "admin",
  LAWYER = "lawyer",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
}

export interface DocumentLink {
  id: string;
  name: string;
  url: string; // OneDrive URL
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
