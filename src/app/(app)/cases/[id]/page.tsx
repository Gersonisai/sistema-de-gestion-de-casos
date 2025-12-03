"use client";

import { useEffect, Suspense, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CaseForm } from "@/components/cases/CaseForm";
import type { CaseFormValues } from "@/components/cases/CaseForm";
import { PageHeader } from "@/components/shared/PageHeader";
import type { Case, User, FileAttachment } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle, Download, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useDocument, useCollection } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp, collection } from "firebase/firestore";

function CaseDetailPageContent() {
  const routeParams = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isAdmin, isLawyer, isSecretary, isClient, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  
  const caseId: string | null = useMemo(() => {
    return typeof routeParams?.id === 'string' ? routeParams.id : null;
  }, [routeParams]);

  const { data: currentCase, isLoading: caseIsLoading, error: caseError } = useDocument<Case>(caseId ? doc(db, "cases", caseId) : null);
  const { data: users, isLoading: usersIsLoading } = useCollection<User>(collection(db, "users"));
  
  const isEditing = searchParams.get('edit') === 'true';

  // Security check effect
  useEffect(() => {
    if (caseIsLoading || authIsLoading || !currentUser || !currentCase) return;

    const isOrgMember = currentCase.organizationId === currentUser.organizationId;
    const isAssignedLawyer = currentCase.assignedLawyerId === currentUser.id;
    const isCaseClient = currentCase.clientId === currentUser.id;

    let hasAccess = false;
    if (isAdmin && isOrgMember) hasAccess = true;
    else if (isSecretary && isOrgMember) hasAccess = true;
    else if (isLawyer && isAssignedLawyer) hasAccess = true;
    else if (isClient && isCaseClient) hasAccess = true;
    
    if (!hasAccess) {
      toast({ variant: "destructive", title: "Acceso Denegado", description: "No tiene permiso para ver este caso."});
      router.replace('/dashboard');
    }

  }, [currentCase, currentUser, caseIsLoading, authIsLoading, isAdmin, isLawyer, isSecretary, isClient, router, toast]);

  const handleSaveCase = async (data: CaseFormValues & { reminders: Case['reminders'], fileAttachments: FileAttachment[] }, caseToUpdate?: Case) => {
    if (!caseToUpdate?.id) return;
    
    const caseRef = doc(db, "cases", caseToUpdate.id);
    await updateDoc(caseRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
    
    toast({ title: "Caso Actualizado", description: `El caso para "${data.clientName}" ha sido actualizado.` });
    router.replace(`/cases/${caseId}`, undefined); // Remove ?edit=true from URL
  };

  const handleDeleteCase = async (id: string) => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, "cases", id));
    toast({ title: "Caso Eliminado", description: "El caso ha sido eliminado exitosamente." });
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
  
  const assignedLawyer = useMemo(() => users?.find(u => u.id === currentCase?.assignedLawyerId), [currentCase, users]);
  const caseClient = useMemo(() => users?.find(u => u.id === currentCase?.clientId), [currentCase, users]);

  let chatPartnerId: string | undefined;
  if(isClient) chatPartnerId = assignedLawyer?.id;
  if(isLawyer) chatPartnerId = caseClient?.id;
  if(isAdmin || isSecretary) chatPartnerId = assignedLawyer?.id || caseClient?.id;


  const lawyersInOrg = useMemo(() => currentUser?.organizationId 
    ? users?.filter(u => u.organizationId === currentUser.organizationId && u.role === UserRole.LAWYER)
    : [], [users, currentUser?.organizationId]);

  if (authIsLoading || caseIsLoading || usersIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (caseError || !currentCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold">Caso No Encontrado o Sin Acceso</h2>
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
                <Link href={`/chat?conversationWith=${chatPartnerId}`}>
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
  
  const getTimestampDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    return new Date(timestamp.seconds * 1000).toISOString();
  }

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
            <div><strong className="text-muted-foreground">Última Actividad:</strong><p>{format(parseISO(getTimestampDate(currentCase.lastActivityDate)), "PPPp", { locale: es })}</p></div>
            <div><strong className="text-muted-foreground">Fecha de Creación:</strong><p>{format(parseISO(getTimestampDate(currentCase.createdAt)), "PPPp", { locale: es })}</p></div>
          </div>

          {!isClient && (
            <div className="pt-4 border-t" id="reminders">
                <h3 className="text-lg font-semibold mb-2">Recordatorios</h3>
                {currentCase.reminders && currentCase.reminders.length > 0 ? (
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
            {currentCase.fileAttachments && currentCase.fileAttachments.length > 0 ? (
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
