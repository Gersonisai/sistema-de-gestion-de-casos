
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Loader2, AlertTriangle, ExternalLink, UserSquare, MessageSquareText, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mockCases, mockUsers } from "@/data/mockData";
import type { Reminder, Case, User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { format, parseISO, isToday, isFuture } from "date-fns";
import { es } from "date-fns/locale/es";
import { generatePushNotification } from '@/ai/flows/generate-push-notification-flow';
import type { GeneratePushNotificationInput, GeneratePushNotificationOutput } from '@/ai/flows/generate-push-notification-flow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ExtendedReminder extends Reminder {
  caseId: string;
  caseClientName: string;
  caseNurej: string;
  assignedLawyerName?: string;
  alertType?: GeneratePushNotificationInput['alertType']; // To store which type was clicked for the dialog
}

export default function RemindersPage() {
  const { currentUser, isAdmin, isLawyer, isLoading: authIsLoading } = useAuth();
  const [allUserReminders, setAllUserReminders] = useState<ExtendedReminder[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);
  const { toast } = useToast();

  const [isGeneratingNotification, setIsGeneratingNotification] = useState(false);
  const [generatedNotificationContent, setGeneratedNotificationContent] = useState<GeneratePushNotificationOutput | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [currentReminderForDialog, setCurrentReminderForDialog] = useState<ExtendedReminder | null>(null);


  useEffect(() => {
    if (authIsLoading) {
      return;
    }
    if (!currentUser) {
      setIsLoadingReminders(false);
      return;
    }

    setIsLoadingReminders(true);

    let relevantCases: Case[];
    if (isAdmin) {
      relevantCases = mockCases;
    } else if (isLawyer) {
      relevantCases = mockCases.filter(c => c.assignedLawyerId === currentUser.id);
    } else {
      relevantCases = [];
    }

    const extractedReminders: ExtendedReminder[] = [];
    relevantCases.forEach(c => {
      let lawyerName: string | undefined = undefined;
      if (isAdmin && c.assignedLawyerId) {
        const lawyer = mockUsers.find(u => u.id === c.assignedLawyerId);
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
  }, [currentUser, isAdmin, isLawyer, authIsLoading]);

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

  const handleGenerateNotification = async (reminder: ExtendedReminder, alertType: GeneratePushNotificationInput['alertType']) => {
    setIsGeneratingNotification(true);
    setGeneratedNotificationContent(null);
    setCurrentReminderForDialog({...reminder, alertType }); // Store alertType for dialog

    const input: GeneratePushNotificationInput = {
      clientName: reminder.caseClientName,
      nurej: reminder.caseNurej,
      reminderMessage: reminder.message,
      reminderDateTimeISO: reminder.date,
      alertType: alertType,
    };

    try {
      const result = await generatePushNotification(input);
      setGeneratedNotificationContent(result);
      setShowNotificationDialog(true);
    } catch (error) {
      console.error("Error generating push notification:", error);
      toast({
        variant: "destructive",
        title: "Error al Generar Notificación",
        description: "No se pudo generar el contenido de la notificación. Intente de nuevo.",
      });
    } finally {
      setIsGeneratingNotification(false);
    }
  };


  if (authIsLoading || isLoadingReminders) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Mis Recordatorios" />
      
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
                  const isLoadingThisReminder = isGeneratingNotification && currentReminderForDialog?.id === reminder.id;
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
                        {isAdmin && reminder.assignedLawyerName && (
                           <p className="text-muted-foreground flex items-center">
                             <UserSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                             Abogado: {reminder.assignedLawyerName}
                           </p>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap justify-end items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleGenerateNotification(reminder, 'IMMINENT')}
                          disabled={isLoadingThisReminder}
                        >
                          {isLoadingThisReminder && currentReminderForDialog?.alertType === 'IMMINENT' ? 
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : 
                            <Sparkles className="mr-2 h-3 w-3 text-yellow-500"/> 
                          }
                          Simular Notif. Previa
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleGenerateNotification(reminder, 'DUE_NOW')}
                          disabled={isLoadingThisReminder}
                        >
                          {isLoadingThisReminder && currentReminderForDialog?.alertType === 'DUE_NOW' ? 
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : 
                            <MessageSquareText className="mr-2 h-3 w-3"/>
                          }
                           Simular Notif. Ahora
                        </Button>
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
                        {isAdmin && reminder.assignedLawyerName && (
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

      {showNotificationDialog && generatedNotificationContent && currentReminderForDialog && (
        <AlertDialog open={showNotificationDialog} onOpenChange={(isOpen) => {
            setShowNotificationDialog(isOpen);
            if (!isOpen) {
                setGeneratedNotificationContent(null);
                setCurrentReminderForDialog(null);
            }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Notificación Simulada para: <span className="ml-1 font-normal italic">{currentReminderForDialog.message}</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-2">
                <p className="mb-3">Así es como se vería la notificación generada por la IA para el tipo de alerta <Badge variant="secondary" className="ml-1">{currentReminderForDialog.alertType === "IMMINENT" ? "Inminente (20 min antes aprox.)" : "En el momento"}</Badge>:</p>
                <div className="p-3 border rounded-md bg-muted space-y-1 text-foreground">
                  <p><strong>Título:</strong> {generatedNotificationContent.title}</p>
                  <p><strong>Cuerpo:</strong> {generatedNotificationContent.body}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {
                setShowNotificationDialog(false);
                setGeneratedNotificationContent(null);
                setCurrentReminderForDialog(null);
              }}>Cerrar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  );
}
    

    