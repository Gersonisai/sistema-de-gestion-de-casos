
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Loader2, AlertTriangle, ExternalLink, UserSquare, CalendarPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mockCases, mockUsers } from "@/data/mockData";
import type { Reminder, Case } from "@/lib/types"; 
import { UserRole } from "@/lib/types";
import { format, parseISO, isToday, isFuture } from "date-fns";
import { es } from "date-fns/locale/es";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlobalReminderForm } from "@/components/reminders/GlobalReminderForm";
import { useToast } from "@/hooks/use-toast";


interface ExtendedReminder extends Reminder {
  caseId: string;
  caseClientName: string;
  caseNurej: string;
  assignedLawyerName?: string;
}

export default function RemindersPage() {
  const { currentUser, isAdmin, isLawyer, isSecretary, isLoading: authIsLoading } = useAuth();
  const [allUserReminders, setAllUserReminders] = useState<ExtendedReminder[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);
  const [showAddReminderDialog, setShowAddReminderDialog] = useState(false);
  const [selectableCases, setSelectableCases] = useState<Case[]>([]);
  const { toast } = useToast();


  const fetchAndSetReminders = useCallback(() => {
    if (!currentUser || !currentUser.organizationId) {
      setIsLoadingReminders(false);
      setSelectableCases([]);
      setAllUserReminders([]);
      return;
    }

    setIsLoadingReminders(true);

    let relevantCases: Case[];
    // Admins and Secretaries see all cases from their organization
    if (isAdmin || isSecretary) {
      relevantCases = mockCases.filter(c => c.organizationId === currentUser.organizationId);
    } else if (isLawyer) { // Lawyers see only their assigned cases within their organization
      relevantCases = mockCases.filter(c => c.organizationId === currentUser.organizationId && c.assignedLawyerId === currentUser.id);
    } else {
      relevantCases = [];
    }
    setSelectableCases(relevantCases);

    const extractedReminders: ExtendedReminder[] = [];
    relevantCases.forEach(c => {
      let lawyerName: string | undefined = undefined;
      // Admin and Secretary can see who is assigned
      if ((isAdmin || isSecretary) && c.assignedLawyerId) {
        const lawyer = mockUsers.find(u => u.id === c.assignedLawyerId && u.organizationId === currentUser.organizationId);
        lawyerName = lawyer?.name;
      }

      c.reminders.forEach(r => {
        extractedReminders.push({
          ...r,
          caseId: c.id,
          caseClientName: c.clientName,
          caseNurej: c.nurej,
          assignedLawyerName: lawyerName,
        });
      });
    });

    extractedReminders.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    
    setAllUserReminders(extractedReminders);
    setIsLoadingReminders(false);
  }, [currentUser, isAdmin, isLawyer, isSecretary]);

  useEffect(() => {
    if (!authIsLoading) {
      fetchAndSetReminders();
    }
  }, [authIsLoading, fetchAndSetReminders]);


  const handleSaveNewGlobalReminder = (
    reminderData: Omit<Reminder, "id" | "createdBy">,
    caseId: string
  ) => {
    if (!currentUser) return;

    const targetCaseIndex = mockCases.findIndex(c => c.id === caseId && c.organizationId === currentUser.organizationId);
    if (targetCaseIndex === -1) {
      toast({ variant: "destructive", title: "Error", description: "Caso no encontrado en su organización." });
      return;
    }

    const newReminder: Reminder = {
      ...reminderData,
      id: `reminder-${Date.now()}`,
      createdBy: currentUser.id,
    };

    mockCases[targetCaseIndex].reminders.push(newReminder);
    mockCases[targetCaseIndex].updatedAt = new Date().toISOString(); 

    fetchAndSetReminders(); 
    setShowAddReminderDialog(false); 
    toast({ title: "Recordatorio Añadido", description: "El nuevo recordatorio ha sido añadido." });
  };


  const getReminderStatus = (dateString: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    const date = parseISO(dateString);
    if (isToday(date)) return { text: "Hoy", variant: "default" };
    if (isFuture(date)) return { text: "Próximo", variant: "secondary" };
    return { text: "Pasado", variant: "outline" };
  };
  
  const upcomingReminders = useMemo(() => {
    return allUserReminders.filter(r => isFuture(parseISO(r.date)) || isToday(parseISO(r.date)));
  }, [allUserReminders]);

  const pastReminders = useMemo(() => {
    return allUserReminders.filter(r => !isFuture(parseISO(r.date)) && !isToday(parseISO(r.date)))
                           .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [allUserReminders]);


  if (authIsLoading || isLoadingReminders) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const canAddReminders = isAdmin || isLawyer || isSecretary;

  return (
    <div className="container mx-auto py-8">
      <PageHeader 
        title="Mis Recordatorios"
        actionButton={
          canAddReminders && (
            <Button onClick={() => setShowAddReminderDialog(true)}>
              <CalendarPlus className="mr-2 h-4 w-4" /> Añadir Nuevo Recordatorio
            </Button>
          )
        }
      />
      
      <section className="mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CalendarCheck className="mr-2 h-6 w-6 text-primary" />
              Recordatorios Próximos y de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-lg">No tienes recordatorios próximos o para hoy.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {upcomingReminders.map(reminder => {
                  const status = getReminderStatus(reminder.date);
                  return (
                    <li key={reminder.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-lg text-primary">{reminder.message}</p>
                        <Badge variant={status.variant} className="capitalize">{status.text}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Fecha: {format(parseISO(reminder.date), "EEEE, dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Caso: <Link href={`/cases/${reminder.caseId}`} className="text-accent hover:underline font-medium">{reminder.caseClientName}</Link> ({reminder.caseNurej})
                        </p>
                        {(isAdmin || isSecretary) && reminder.assignedLawyerName && (
                           <p className="text-muted-foreground flex items-center">
                             <UserSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                             Abogado: {reminder.assignedLawyerName}
                           </p>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap justify-end items-center gap-2">
                        <Button variant="ghost" size="sm" asChild className="ml-auto md:ml-0">
                           <Link href={`/cases/${reminder.caseId}#reminders`}>
                             Ver Detalles del Caso <ExternalLink className="ml-2 h-3 w-3"/>
                           </Link>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CalendarCheck className="mr-2 h-6 w-6 text-muted-foreground" />
              Recordatorios Pasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastReminders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-lg">No tienes recordatorios pasados.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {pastReminders.map(reminder => {
                   const status = getReminderStatus(reminder.date);
                  return (
                    <li key={reminder.id} className="p-4 border rounded-lg shadow-sm bg-card/80 opacity-75">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-md">{reminder.message}</p>
                         <Badge variant={status.variant} className="capitalize">{status.text}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Fecha: {format(parseISO(reminder.date), "EEEE, dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Caso: <Link href={`/cases/${reminder.caseId}`} className="text-accent hover:underline font-medium">{reminder.caseClientName}</Link> ({reminder.caseNurej})
                        </p>
                        {(isAdmin || isSecretary) && reminder.assignedLawyerName && (
                           <p className="text-muted-foreground flex items-center">
                             <UserSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                             Abogado: {reminder.assignedLawyerName}
                           </p>
                        )}
                      </div>
                       <div className="mt-3 flex justify-end items-center">
                         <Button variant="ghost" size="sm" asChild>
                           <Link href={`/cases/${reminder.caseId}#reminders`}>
                             Ver Detalles del Caso <ExternalLink className="ml-2 h-3 w-3"/>
                           </Link>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
      
      <Dialog open={showAddReminderDialog} onOpenChange={setShowAddReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Recordatorio</DialogTitle>
          </DialogHeader>
          {selectableCases.length > 0 ? (
            <GlobalReminderForm
              cases={selectableCases}
              onSave={handleSaveNewGlobalReminder}
              onClose={() => setShowAddReminderDialog(false)}
            />
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <p>No hay casos disponibles en su organización para añadir recordatorios.</p>
              {isLawyer && <p className="text-sm">Asegúrese de tener casos asignados.</p>}
              {(isAdmin || isSecretary) && <p className="text-sm">Asegúrese de que existan casos en su organización.</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
