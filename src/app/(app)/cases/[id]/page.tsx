
"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CaseForm } from "@/components/cases/CaseForm";
import type { CaseFormValues } from "@/components/cases/CaseForm";
import { PageHeader } from "@/components/shared/PageHeader";
import type { Case, User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { mockCases, mockUsers } from "@/data/mockData"; 
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

function CaseDetailPageContent() {
  const routeParams = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isAdmin, isLawyer, isSecretary, isLoading: authIsLoading } = useAuth();
  
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
    // Simulate fetching case data and filter by organization
    let foundCase = mockCases.find((c) => c.id === caseId);
    if (foundCase && currentUser?.organizationId && foundCase.organizationId !== currentUser.organizationId) {
      // If case belongs to a different org, treat as not found for this user (unless system admin)
      // This logic might need refinement for a true "system admin" who sees all orgs.
      // For now, assume org admins/lawyers/secretaries only see their org's cases.
      if (currentUser.role !== UserRole.ADMIN || currentUser.organizationId !== "org_default_admin" ) { // Example: system admin
        foundCase = undefined; 
      }
    }
    setCurrentCase(foundCase || null);
  }, [caseId, routeParams, authIsLoading, currentCase, currentUser]);

  useEffect(() => {
    setIsEditing(searchParams.get('edit') === 'true');
  }, [searchParams]);

  const handleSaveCase = async (data: CaseFormValues & { reminders: any[], documentLinks: any[], organizationId?: string }, caseToUpdate?: Case) => {
    console.log("Updated case data:", data, "for case:", caseToUpdate?.id);
    if (caseToUpdate) {
        const caseIndex = mockCases.findIndex(c => c.id === caseToUpdate.id);
        if (caseIndex !== -1) {
            mockCases[caseIndex] = {
                ...mockCases[caseIndex],
                ...data,
                updatedAt: new Date().toISOString(),
            };
        }
    }
    setIsEditing(false);
  };

  const handleDeleteCase = async (id: string) => {
    if (!isAdmin) return; // Only admin can delete from here
    const caseIndex = mockCases.findIndex(c => c.id === id);
    if (caseIndex !== -1) {
        mockCases.splice(caseIndex, 1);
    }
    router.push('/dashboard');
  };

  const canEditThisCase = isAdmin || isSecretary || (isLawyer && currentCase?.assignedLawyerId === currentUser?.id);
  const canDeleteThisCase = isAdmin;

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
          El caso que está buscando no existe, no tiene un ID válido en la URL, ha sido eliminado, o no pertenece a su organización.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Volver al Dashboard</Link>
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
  
  const assignedLawyer = mockUsers.find(u => u.id === currentCase.assignedLawyerId);
  return (
    <div className="container mx-auto py-8">
      <PageHeader 
        title={`Detalle del Caso: ${currentCase.clientName}`}
        actionButton={canEditThisCase && (
          <Button onClick={() => router.push(`/cases/${caseId}?edit=true`)} className="shadow-md">
            Editar Caso
          </Button>
        )}
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
            <div><strong className="text-muted-foreground">Última Actividad:</strong><p>{format(parseISO(currentCase.lastActivityDate), "PPPp", { locale: es })}</p></div>
            <div><strong className="text-muted-foreground">Fecha de Creación:</strong><p>{format(parseISO(currentCase.createdAt), "PPPp", { locale: es })}</p></div>
          </div>

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

          <div className="pt-4 border-t" id="documents">
            <h3 className="text-lg font-semibold mb-2">Documentos (Enlaces OneDrive)</h3>
            {currentCase.documentLinks.length > 0 ? (
              <ul className="space-y-2">
                {currentCase.documentLinks.map(d => (
                  <li key={d.id} className="p-3 border rounded-md bg-muted/50">
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{d.name}</a>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No hay documentos enlazados.</p>}
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
