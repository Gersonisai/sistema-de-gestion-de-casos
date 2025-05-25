
import type { User, Case, Reminder, DocumentLink, Organization } from "@/lib/types";
import { UserRole, CaseSubject, PROCESS_STAGES } from "@/lib/types";

// Simulate a list of organizations/consorcios
export const mockOrganizations: Organization[] = [
  {
    id: "org_default_admin",
    name: "Bufete Administrador Principal (Sistema)",
    ownerId: "Uh8GnPZnGkNVpEqXwsPJJtTc8R63", // Default Admin's UID
    plan: "system_admin", // Special plan for the super admin
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];


export const mockUsers: User[] = [
  {
    id: "Uh8GnPZnGkNVpEqXwsPJJtTc8R63", // Admin UID from Firebase
    email: "admin@lexcase.com",
    name: "Admin LexCase", // This is the platform admin
    role: UserRole.ADMIN, // This role might be "SUPER_ADMIN" in a real multi-tenant app
    organizationId: "org_default_admin", // Belongs to a special system organization
  },
  {
    id: "ExyIt8HKmsOoZhkjaIUdC8Rdm733", 
    email: "abogado1@lexcase.com",
    name: "Lic. Ana Pérez",
    role: UserRole.LAWYER,
    organizationId: "org_default_admin", // Assuming they belong to the admin's org for now
  },
  {
    id: "lawyer002_placeholder_uid", // Placeholder, should be updated if this user logs in via Firebase
    email: "abogado2@lexcase.com",
    name: "Lic. Carlos López",
    role: UserRole.LAWYER,
    organizationId: "org_default_admin", // Assuming they belong to the admin's org for now
  },
];

const createReminders = (caseId: string, userId: string): Reminder[] => [
  {
    id: `${caseId}-reminder1`,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
    message: "Preparar alegatos finales",
    createdBy: userId,
  },
];

const createDocumentLinks = (caseId: string): DocumentLink[] => [
  {
    id: `${caseId}-doc1`,
    name: "Demanda Inicial.pdf",
    url: "https://onedrive.live.com/demanda_inicial_placeholder",
  },
  {
    id: `${caseId}-doc2`,
    name: "Pruebas Cliente.zip",
    url: "https://onedrive.live.com/pruebas_cliente_placeholder",
  },
];

export const mockCases: Case[] = [
  {
    id: "case001",
    nurej: "202300101",
    clientName: "Juan Rodríguez",
    cause: "Incumplimiento de contrato",
    processStage: PROCESS_STAGES[1],
    nextActivity: "Audiencia de conciliación",
    subject: CaseSubject.CIVIL,
    assignedLawyerId: "ExyIt8HKmsOoZhkjaIUdC8Rdm733", 
    lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reminders: createReminders("case001", "ExyIt8HKmsOoZhkjaIUdC8Rdm733"),
    documentLinks: createDocumentLinks("case001"),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: "org_default_admin", // Assuming cases belong to the admin's org for now
  },
  {
    id: "case002",
    nurej: "202300202",
    clientName: "María García",
    cause: "Despido injustificado",
    processStage: PROCESS_STAGES[0],
    nextActivity: "Presentación de demanda",
    subject: CaseSubject.LABORAL,
    assignedLawyerId: "lawyer002_placeholder_uid",
    lastActivityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reminders: [],
    documentLinks: createDocumentLinks("case002"),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: "org_default_admin",
  },
  {
    id: "case003",
    nurej: "202300303",
    clientName: "Pedro Martinez",
    cause: "Robo Agravado",
    processStage: PROCESS_STAGES[2],
    nextActivity: "Juicio Oral",
    subject: CaseSubject.PENAL,
    assignedLawyerId: "ExyIt8HKmsOoZhkjaIUdC8Rdm733", 
    lastActivityDate: new Date().toISOString(), 
    reminders: createReminders("case003", "ExyIt8HKmsOoZhkjaIUdC8Rdm733"),
    documentLinks: [],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: "org_default_admin",
  },
  {
    id: "case004",
    nurej: "202300404",
    clientName: "Constructora XYZ S.R.L.",
    cause: "Reclamo por vicios ocultos",
    processStage: PROCESS_STAGES[1],
    nextActivity: "Inspección judicial",
    subject: CaseSubject.CIVIL,
    lastActivityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reminders: [],
    documentLinks: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: "org_default_admin",
  }
];
