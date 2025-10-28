
import type { User, Case, Reminder, FileAttachment, Organization } from "@/lib/types";
import { UserRole, CaseSubject, PROCESS_STAGES, THEME_PALETTES, CASE_SUBJECTS_OPTIONS, PLAN_LIMITS } from "@/lib/types";

// Simulate a list of organizations/consorcios
export const mockOrganizations: Organization[] = [
  {
    id: "org_default_admin",
    name: "Bufete Administrador Principal (Sistema)",
    ownerId: "Uh8GnPZnGkNVpEqXwsPJJtTc8R63", // Default Admin's UID
    plan: "system_admin",
    themePalette: THEME_PALETTES[0].id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStorageUsedBytes: 0,
    maxStorageGB: PLAN_LIMITS.system_admin.maxStorageGB,
  },
  {
    id: "org_bufete_test_1",
    name: "Bufete de Pruebas Uno",
    ownerId: "admin_test_org_1_uid", // Placeholder UID for this org's admin
    plan: "premium",
    themePalette: THEME_PALETTES[1].id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStorageUsedBytes: 1024 * 1024 * 5, // Approx 5MB used
    maxStorageGB: PLAN_LIMITS.premium.maxStorageGB,
  },
  {
    id: "org_bufete_gerson_machuca",
    name: "Bufete Gerson Machuca",
    ownerId: "gerson_machuca_admin_uid",
    plan: "premium", 
    themePalette: THEME_PALETTES[2].id, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStorageUsedBytes: 0,
    maxStorageGB: PLAN_LIMITS.premium.maxStorageGB,
  }
];


export const mockUsers: User[] = [
  // --- CLIENTES ---
  {
    id: "client001_placeholder_uid",
    email: "cliente1@email.com",
    name: "Carlos Soliz",
    role: UserRole.CLIENT,
    location: "Santa Cruz de la Sierra, Bolivia",
  },
  {
    id: "client002_placeholder_uid",
    email: "cliente2@email.com",
    name: "Brenda Mendoza",
    role: UserRole.CLIENT,
    location: "Buenos Aires, Argentina",
  },
  
  // --- ADMINISTRADORES ---
  {
    id: "Uh8GnPZnGkNVpEqXwsPJJtTc8R63", // Admin UID from Firebase
    email: "admin@lexcase.com",
    name: "Admin YASI K'ARI",
    role: UserRole.ADMIN,
    organizationId: "org_default_admin",
    location: "La Paz, Bolivia",
    specialties: [CaseSubject.ADMINISTRATIVO, CaseSubject.CIVIL],
  },
  {
    id: "admin_test_org_1_uid",
    email: "admin.org1@yasikari.com",
    name: "Admin Bufete Uno",
    role: UserRole.ADMIN,
    organizationId: "org_bufete_test_1",
    location: "Cochabamba, Bolivia",
    specialties: [CaseSubject.LABORAL],
  },
  {
    id: "gerson_machuca_admin_uid", 
    email: "machuagerson98@gmail.com",
    name: "Gerson Machuca",
    role: UserRole.ADMIN,
    organizationId: "org_bufete_gerson_machuca",
    location: "Bogotá, Colombia",
    specialties: [CaseSubject.PENAL, CaseSubject.COMERCIAL],
  },

  // --- ABOGADOS ---
  {
    id: "ExyIt8HKmsOoZhkjaIUdC8Rdm733",
    email: "abogado1@lexcase.com",
    name: "Lic. Ana Pérez",
    role: UserRole.LAWYER,
    organizationId: "org_bufete_test_1",
    location: "Cochabamba, Bolivia",
    specialties: [CaseSubject.PENAL, CaseSubject.FAMILIAR],
    bio: "Abogada con 10 años de experiencia en derecho penal y familiar, comprometida con la justicia y la defensa de los derechos de mis clientes. Especializada en litigios complejos.",
    profilePictureUrl: "https://placehold.co/400x400/E8D5C4/614124?text=AP",
    hourlyRateRange: [80, 150],
  },
  {
    id: "lawyer002_placeholder_uid",
    email: "abogado2@lexcase.com",
    name: "Lic. Carlos López",
    role: UserRole.LAWYER,
    organizationId: "org_bufete_test_1",
    location: "Santa Cruz de la Sierra, Bolivia",
    specialties: [CaseSubject.CIVIL, CaseSubject.COMERCIAL, CaseSubject.LABORAL],
    bio: "Especialista en derecho civil y comercial, con enfoque en contratos y litigios empresariales. Asesoramiento integral a empresas y particulares.",
    profilePictureUrl: "https://placehold.co/400x400/D2E0FB/394867?text=CL",
    hourlyRateRange: [100, 200],
  },

  // --- SECRETARIAS ---
  {
    id: "secretary001_placeholder_uid",
    email: "secretaria1@lexcase.com",
    name: "Sra. Laura Vargas",
    role: UserRole.SECRETARY,
    organizationId: "org_bufete_test_1",
    location: "Cochabamba, Bolivia",
  },
];

const createReminders = (caseId: string, userId: string, daysOffset: number = 7, messageBase: string = "Preparar para"): Reminder[] => {
  const reminders: Reminder[] = [];
  const numReminders = Math.floor(Math.random() * 3) + 1; // 1 to 3 reminders

  for (let i = 0; i < numReminders; i++) {
    const reminderDate = new Date();
    const randomDayOffset = Math.floor(Math.random() * daysOffset * 2) - daysOffset; // +/- daysOffset
    reminderDate.setDate(reminderDate.getDate() + randomDayOffset + (i*2)); // Stagger reminder dates a bit
    reminderDate.setHours(Math.floor(Math.random() * 10) + 8, Math.random() > 0.5 ? 30 : 0); // Random time between 08:00 and 17:30

    reminders.push({
      id: `${caseId}-reminder${i+1}-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substring(2, 7)}`,
      date: reminderDate.toISOString(),
      message: `${messageBase} - Actividad ${i+1}`,
      createdBy: userId,
    });
  }
  return reminders;
};

const createFileAttachments = (caseId: string, organizationId: string): FileAttachment[] => {
  const attachments: FileAttachment[] = [];
  const numAttachments = Math.floor(Math.random() * 4); // 0 to 3 attachments
  const fileTypes = [
    { name: "Documento_Legal", ext: "pdf", type: "application/pdf", size: 1024 * (Math.floor(Math.random() * 300) + 50) },
    { name: "Evidencia_Fotografica", ext: "jpg", type: "image/jpeg", size: 1024 * 1024 * (Math.floor(Math.random() * 3) + 1) },
    { name: "Planilla_Calculo", ext: "xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 1024 * (Math.floor(Math.random() * 100) + 20) },
    { name: "Presentacion_Caso", ext: "pptx", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", size: 1024 * 1024 * (Math.floor(Math.random() * 2) + 1) },
    { name: "Nota_Texto", ext: "txt", type: "text/plain", size: 1024 * (Math.floor(Math.random() * 10) + 1) },
  ];

  for (let i = 0; i < numAttachments; i++) {
    const fileInfo = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const fileName = `${fileInfo.name}_${caseId.split('_')[0]}_${i+1}.${fileInfo.ext}`; // Use original caseId base for filename consistency
    attachments.push({
      id: `${caseId}-doc${i+1}-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substring(2, 7)}`,
      fileName: fileName,
      gcsPath: `tenants/${organizationId}/casos/${caseId}/documentos/${fileName}`,
      contentType: fileInfo.type,
      size: fileInfo.size,
      uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(), // Uploaded in the last 30 days
    });
  }
  return attachments;
};

const baseCases: Case[] = [
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
    reminders: createReminders("case001", "ExyIt8HKmsOoZhkjaIUdC8Rdm733", 10, "Revisar contrato"),
    fileAttachments: createFileAttachments("case001", "org_bufete_test_1"),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: "org_bufete_test_1",
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
    reminders: createReminders("case002", "lawyer002_placeholder_uid", 5, "Llamar a cliente"),
    fileAttachments: createFileAttachments("case002", "org_bufete_test_1"),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: "org_bufete_test_1",
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
    reminders: createReminders("case003", "ExyIt8HKmsOoZhkjaIUdC8Rdm733", 3, "Preparar testigos"),
    fileAttachments: [],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: "org_bufete_test_1",
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
    fileAttachments: createFileAttachments("case004", "org_bufete_test_1"),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: "org_bufete_test_1",
  },
  {
    id: "case005",
    nurej: "202400001",
    clientName: "Empresa Soluciones Globales",
    cause: "Asesoría contractual",
    processStage: PROCESS_STAGES[0],
    nextActivity: "Revisión de borrador de contrato",
    subject: CaseSubject.CIVIL,
    assignedLawyerId: "lawyer002_placeholder_uid",
    lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reminders: createReminders("case005", "lawyer002_placeholder_uid", 14, "Finalizar revisión"),
    fileAttachments: createFileAttachments("case005", "org_bufete_test_1"),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: "org_bufete_test_1",
  }
];

const additionalMockCasesForOrg1: Case[] = Array.from({ length: 20 }, (_, i) => {
  const caseNum = i + 6; // Start from case006
  const caseId = `case${String(caseNum).padStart(3, '0')}`;
  const randomSubject = CASE_SUBJECTS_OPTIONS[Math.floor(Math.random() * CASE_SUBJECTS_OPTIONS.length)];
  const randomProcessStage = PROCESS_STAGES[Math.floor(Math.random() * PROCESS_STAGES.length)];
  const lawyerIds = ["ExyIt8HKmsOoZhkjaIUdC8Rdm733", "lawyer002_placeholder_uid", undefined]; // Includes unassigned
  const assignedLawyerId = lawyerIds[Math.floor(Math.random() * lawyerIds.length)];
  const createdDaysAgo = Math.floor(Math.random() * 180) + 1; // 1 to 180 days ago
  const lastActivityDaysAgo = Math.floor(Math.random() * createdDaysAgo);

  const clientNames = ["Carlos Vargas", "Lucía Méndez", "Transportes Rápidos S.A.", "Inversiones Seguras Ltda.", "Familia Gutiérrez", "Ricardo Soto", "Ana Lucía Jiménez", "Servicios Integrales Co.", "Ernesto Villanueva", "Laura Fernández"];
  const causes = ["Divorcio y bienes", "Estafa y apropiación indebida", "Reclamo de pago", "Accidente de tránsito", "Custodia de menores", "Incumplimiento de servicios", "Defensa penal", "Asesoría tributaria", "Constitución de sociedad", "Liquidación de empresa"];
  const nextActivities = ["Citar a testigos", "Presentar pruebas", "Audiencia de medidas cautelares", "Solicitar peritaje", "Negociar acuerdo", "Investigar bienes", "Reunión con fiscal", "Elaborar informe", "Redactar estatutos", "Notificar a acreedores"];
  const orgIdForTheseCases = "org_bufete_test_1";
  const defaultUserIdForReminders = assignedLawyerId || "admin_test_org_1_uid";


  return {
    id: caseId,
    nurej: `2024${String(Math.floor(Math.random() * 8999) + 1000)}${String(caseNum).padStart(2, '0')}`,
    clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
    cause: causes[Math.floor(Math.random() * causes.length)],
    processStage: randomProcessStage,
    nextActivity: nextActivities[Math.floor(Math.random() * nextActivities.length)],
    subject: randomSubject,
    assignedLawyerId: assignedLawyerId,
    lastActivityDate: new Date(Date.now() - lastActivityDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
    reminders: createReminders(caseId, defaultUserIdForReminders, Math.floor(Math.random()*20)+1, `Seguimiento ${randomSubject}`),
    fileAttachments: createFileAttachments(caseId, orgIdForTheseCases),
    createdAt: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - lastActivityDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: orgIdForTheseCases,
  };
});

const allCases: Case[] = [...baseCases, ...additionalMockCasesForOrg1];

// Duplicate additionalMockCasesForOrg1 for other admin organizations
const adminUsers = mockUsers.filter(u => u.role === UserRole.ADMIN);
const sourceOrgIdForDuplication = "org_bufete_test_1"; // Cases from this org will be duplicated

adminUsers.forEach(admin => {
  if (admin.organizationId && admin.organizationId !== sourceOrgIdForDuplication) {
    const targetOrgId = admin.organizationId;
    const casesForThisAdminOrg = additionalMockCasesForOrg1.map((originalCase, index) => {
      const newCaseId = `${originalCase.id}_${targetOrgId.slice(-4)}_${index}`; // Make ID more unique
      return {
        ...originalCase,
        id: newCaseId,
        organizationId: targetOrgId,
        assignedLawyerId: undefined, // No lawyers defined in these other mock orgs
        reminders: originalCase.reminders.map(r => ({
          ...r,
          id: `${newCaseId}-reminder${r.id.split('-').pop()}`, // Attempt to keep some uniqueness
          createdBy: admin.id, // Admin of the new org creates the reminder
        })),
        fileAttachments: originalCase.fileAttachments.map(fa => ({
          ...fa,
          id: `${newCaseId}-doc${fa.id.split('-').pop()}`,
          gcsPath: `tenants/${targetOrgId}/casos/${newCaseId}/documentos/${fa.fileName}`,
        })),
        // NUREJ should ideally be unique per real case, but for mock data we can keep it or slightly alter
        nurej: `${originalCase.nurej.slice(0, -2)}${String(index + 10).padStart(2, '0')}`, // Make NUREJ slightly different
      };
    });
    allCases.push(...casesForThisAdminOrg);
  }
});


export const mockCases: Case[] = allCases;
