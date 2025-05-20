import type { User, Case, Reminder, DocumentLink } from "@/lib/types";
import { UserRole, CaseSubject, PROCESS_STAGES } from "@/lib/types";

export const mockUsers: User[] = [
  {
    id: "admin001",
    email: "admin@lexcase.com",
    name: "Admin LexCase",
    role: UserRole.ADMIN,
  },
  {
    id: "lawyer001",
    email: "abogado1@lexcase.com",
    name: "Lic. Ana Pérez",
    role: UserRole.LAWYER,
  },
  {
    id: "lawyer002",
    email: "abogado2@lexcase.com",
    name: "Lic. Carlos López",
    role: UserRole.LAWYER,
  },
];

const createReminders = (caseId: string, userId: string): Reminder[] => [
  {
    id: `${caseId}-reminder1`,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
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
    assignedLawyerId: "lawyer001",
    lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    reminders: createReminders("case001", "lawyer001"),
    documentLinks: createDocumentLinks("case001"),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "case002",
    nurej: "202300202",
    clientName: "María García",
    cause: "Despido injustificado",
    processStage: PROCESS_STAGES[0],
    nextActivity: "Presentación de demanda",
    subject: CaseSubject.LABORAL,
    assignedLawyerId: "lawyer002",
    lastActivityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    reminders: [],
    documentLinks: createDocumentLinks("case002"),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "case003",
    nurej: "202300303",
    clientName: "Pedro Martinez",
    cause: "Robo Agravado",
    processStage: PROCESS_STAGES[2],
    nextActivity: "Juicio Oral",
    subject: CaseSubject.PENAL,
    assignedLawyerId: "lawyer001",
    lastActivityDate: new Date().toISOString(), // Today
    reminders: createReminders("case003", "lawyer001"),
    documentLinks: [],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "case004",
    nurej: "202300404",
    clientName: "Constructora XYZ S.R.L.",
    cause: "Reclamo por vicios ocultos",
    processStage: PROCESS_STAGES[1],
    nextActivity: "Inspección judicial",
    subject: CaseSubject.CIVIL,
    // No assigned lawyer initially
    lastActivityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reminders: [],
    documentLinks: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
