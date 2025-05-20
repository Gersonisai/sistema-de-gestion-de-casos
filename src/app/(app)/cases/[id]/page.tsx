"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CaseForm } from "@/components/cases/CaseForm";
import type { CaseFormValues } from "@/components/cases/CaseForm";
import { PageHeader } from "@/components/shared/PageHeader";
import type { Case } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { mockCases, mockUsers } from "@/data/mockData"; // To simulate fetching and updating
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

function CaseDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isAdmin, isLoading: authIsLoading } = useAuth();
  
  const [currentCase, setCurrentCase] = useState<Case | null | undefined>(undefined); // undefined for loading, null for not found
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');

  const caseId = params.id as string;

  useEffect(() => {
    // Simulate fetching case data
    const foundCase = mockCases.find((c) => c.id === caseId);
    setCurrentCase(foundCase || null);
  }, [caseId]);

  useEffect(() => {
    setIsEditing(searchParams.get('edit') === 'true');
  }, [searchParams]);

  const handleSaveCase = async (data: CaseFormValues & { reminders: any[], documentLinks: any[] }, caseToUpdate?: Case) => {
    // In a real app, this would be an API call.
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
    // router.push(`/cases/${caseId}`); // Navigation handled by CaseForm on success
    setIsEditing(false); // Exit edit mode after save
  };

  const handleDeleteCase = async (id: string) => {
    const caseIndex = mockCases.findIndex(c => c.id === id);
    if (caseIndex !== -1) {
        mockCases.splice(caseIndex, 1);
    }
    // router.push('/dashboard'); // Navigation handled by CaseForm on success
  };

  const canEditThisCase = isAdmin || (currentUser?.role === UserRole.LAWYER && currentCase?.assignedLawyerId === currentUser?.id);

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
          El caso que está buscando no existe o ha sido eliminado.
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
        <CaseForm initialData={currentCase} onSave={handleSaveCase as any} onDelete={isAdmin ? handleDeleteCase : undefined} />
      </div>
    );
  }
  
  // View Mode
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

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Recordatorios</h3>
            {currentCase.reminders.length > 0 ? (
              <ul className="space-y-2">
                {currentCase.reminders.map(r => (
                  <li key={r.id} className="p-3 border rounded-md bg-muted/50">
                    <p className="font-medium">{r.message}</p>
                    <p className="text-sm text-muted-foreground">Fecha: {format(parseISO(r.date), "PPP", { locale: es })}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No hay recordatorios.</p>}
          </div>

          <div className="pt-4 border-t">
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
    // Suspense boundary for useSearchParams
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <CaseDetailPageContent />
    </Suspense>
  );
}

