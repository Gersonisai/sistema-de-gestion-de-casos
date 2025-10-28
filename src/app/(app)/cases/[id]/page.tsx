
"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CaseForm } from "@/components/cases/CaseForm";
import type { CaseFormValues } from "@/components/cases/CaseForm";
import { PageHeader } from "@/components/shared/PageHeader";
import type { Case, User, FileAttachment } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { mockCases, mockUsers } from "@/data/mockData"; 
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle, Download, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";


function CaseDetailPageContent() {
  const routeParams = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isAdmin, isLawyer, isSecretary, isClient, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentCase, setCurrentCase] = useState<Case | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');

  const caseId: string | null = useMemo(() => {
    return typeof routeParams?.id === 'string' ? routeParams.id : null;
  }, [routeParams]);

  useEffect(() => {
    if (!caseId) {
      if (routeParams && !authIsLoading && currentCase === undefined) {
         setCurrentCase(null);
      }
      return;
    }
    let foundCase = mockCases.find((c) => c.id === caseId);

    // Security check
    if (foundCase && currentUser) {
        const isOrgMember = foundCase.organizationId === currentUser.organizationId;
        const isAssignedLawyer = foundCase.assignedLawyerId === currentUser.id;
        const isCaseClient = foundCase.clientId === currentUser.id;

        if (isClient && !isCaseClient) {
            foundCase = undefined;
        } else if (!isClient && !isOrgMember && currentUser.role !== UserRole.ADMIN) {
            foundCase = undefined;
        } else if (isLawyer && !isAssignedLawyer) {
            foundCase = undefined;
        }
    } else if (!currentUser) {
        foundCase = undefined;
    }

    setCurrentCase(foundCase || null);
  }, [caseId, routeParams, authIsLoading, currentCase, currentUser, isClient, isLawyer]);

  useEffect(() => {
    setIsEditing(searchParams.get('edit') === 'true');
  }, [searchParams]);

  const handleSaveCase = async (data: CaseFormValues & { reminders: Case['reminders'], fileAttachments: FileAttachment[], organizationId?: string }, caseToUpdate?: Case) => {
    console.log("Updated case data:", data, "for case:", caseToUpdate?.id);
    if (caseToUpdate) {
        const caseIndex = mockCases.findIndex(c => c.id === caseToUpdate.id);
        if (caseIndex !== -1) {
            mockCases[caseIndex] = {
                ...mockCases[caseIndex],
                ...data,
                updatedAt: new Date().toISOString(),
                reminders: data.reminders || mockCases[caseIndex].reminders,
                fileAttachments: data.fileAttachments || mockCases[caseIndex].fileAttachments,
            };
        }
    }
    setCurrentCase(prev => prev ? {...prev, ...data} : null); // Update local state for immediate UI reflection
    setIsEditing(false);
    router.replace(`/cases/${caseId}`, undefined); // Remove ?edit=true from URL
  };

  const handleDeleteCase = async (id: string) => {
    if (!isAdmin) return;
    const caseIndex = mockCases.findIndex(c => c.id === id);
    if (caseIndex !== -1) {
        mockCases.splice(caseIndex, 1);
    }
    router.push('/dashboard');
  };

  const handleSimulatedDownload = (attachment: FileAttachment) => {
    console.log(`[FRONTEND SIMULATION] Requesting download URL for: ${attachment.fileName} from path: ${attachment.gcsPath}`);
    toast({
      title: "Descarga Simulada",
      description: `Se iniciaría la descarga de "${attachment.fileName}". (URL firmada no implementada en backend).`,
    });
    window.open(`https://placehold.co/300x200.png?text=Simulated+Download+of+${attachment.fileName}`, "_blank");
  };

  const canEditThisCase = isAdmin || isSecretary || (isLawyer && currentCase?.assignedLawyerId === currentUser?.id);
  const canDeleteThisCase = isAdmin;
  const assignedLawyer = useMemo(() => mockUsers.find(u => u.id === currentCase?.assignedLawyerId), [currentCase]);
  const caseClient = useMemo(() => mockUsers.find(u => u.id === currentCase?.clientId), [currentCase]);

  let chatPartnerId: string | undefined;
  if(isClient) chatPartnerId = assignedLawyer?.id;
  if(isLawyer) chatPartnerId = caseClient?.id;
  if(isAdmin || isSecretary) chatPartnerId = assignedLawyer?.id || caseClient?.id;


  const lawyersInOrg = currentUser?.organizationId 
    ? mockUsers.filter(u => u.organizationId === currentUser.organizationId && u.role === UserRole.LAWYER)
    : [];

  if (authIsLoading || currentCase === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (currentCase === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold">Caso No Encontrado</h2>
        <p className="text-muted-foreground mt-2">
          El caso que está buscando no existe, ha sido eliminado o no tiene permiso para verlo.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Volver al Panel</Link>
        </Button>
      </div>
    );
  }

  if (isEditing && canEditThisCase) {
    return (
      <div className="container mx-auto py-8">
        <CaseForm 
            initialData={currentCase} 
            onSave={handleSaveCase as any} 
            onDelete={canDeleteThisCase ? handleDeleteCase : undefined} 
            lawyersForAssignment={lawyersInOrg}
        />
      </div>
    );
  }
  
  const pageActions = (
    <div className="flex gap-2">
        {chatPartnerId && (
            <Button asChild variant="outline">
                <Link href={`/chat?conversationId=${chatPartnerId}`}>
                    <MessageSquare className="mr-2 h-4 w-4"/>
                    Chatear
                </Link>
            </Button>
        )}
        {canEditThisCase && (
            <Button onClick={() => router.push(`/cases/${caseId}?edit=true`)} className="shadow-md">
                Editar Caso
            </Button>
        )}
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <PageHeader 
        title={`Detalle del Caso: ${currentCase.clientName}`}
        actionButton={pageActions}
      />
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-primary">{currentCase.clientName}</CardTitle>
            <Badge variant={currentCase.subject === "Penal" ? "destructive" : "secondary"} className="capitalize">
              {currentCase.subject.toLowerCase()}
            </Badge>
          </div>
          <CardDescription>NUREJ: {currentCase.nurej}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><strong className="text-muted-foreground">Causa:</strong><p>{currentCase.cause}</p></div>
            <div><strong className="text-muted-foreground">Etapa del Proceso:</strong><p>{currentCase.processStage}</p></div>
            <div><strong className="text-muted-foreground">Próxima Actividad:</strong><p>{currentCase.nextActivity}</p></div>
            {assignedLawyer && <div><strong className="text-muted-foreground">Abogado Asignado:</strong><p>{assignedLawyer.name}</p></div>}
            {caseClient && !isClient && <div><strong className="text-muted-foreground">Cliente:</strong><p>{caseClient.name} ({caseClient.email})</p></div>}
            <div><strong className="text-muted-foreground">Última Actividad:</strong><p>{format(parseISO(currentCase.lastActivityDate), "PPPp", { locale: es })}</p></div>
            <div><strong className="text-muted-foreground">Fecha de Creación:</strong><p>{format(parseISO(currentCase.createdAt), "PPPp", { locale: es })}</p></div>
          </div>

          {!isClient && (
            <div className="pt-4 border-t" id="reminders">
                <h3 className="text-lg font-semibold mb-2">Recordatorios</h3>
                {currentCase.reminders.length > 0 ? (
                <ul className="space-y-2">
                    {currentCase.reminders.map(r => (
                    <li key={r.id} className="p-3 border rounded-md bg-muted/50">
                        <p className="font-medium">{r.message}</p>
                        <p className="text-sm text-muted-foreground">Fecha: {format(parseISO(r.date), "Pp HH:mm", { locale: es })}</p>
                    </li>
                    ))}
                </ul>
                ) : <p className="text-muted-foreground">No hay recordatorios.</p>}
            </div>
          )}

          <div className="pt-4 border-t" id="documents">
            <h3 className="text-lg font-semibold mb-2">Archivos Adjuntos</h3>
            {currentCase.fileAttachments.length > 0 ? (
              <ul className="space-y-2">
                {currentCase.fileAttachments.map(attachment => (
                  <li key={attachment.id} className="p-3 border rounded-md bg-muted/50 flex justify-between items-center hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{attachment.fileName}</span>
                        {attachment.size && <span className="text-xs text-muted-foreground">({(attachment.size / 1024).toFixed(1)} KB)</span>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleSimulatedDownload(attachment)} title="Descargar (Simulado)">
                        <Download className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No hay archivos adjuntos.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function CaseDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <CaseDetailPageContent />
    </Suspense>
  );
}
