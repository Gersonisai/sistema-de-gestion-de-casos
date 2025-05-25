
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Case, User } from "@/lib/types";
import { CASE_SUBJECTS_OPTIONS, PROCESS_STAGES, UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
// import { mockUsers } from "@/data/mockData"; // Lawyers list passed as prop
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Trash2, PlusCircle, CalendarPlus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ReminderForm } from "./ReminderForm";
import { DocumentLinkForm } from "./DocumentLinkForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const UNASSIGNED_LAWYER_VALUE = "UNASSIGNED_LAWYER_VALUE_KEY_NO_EMPTY";

const caseFormSchema = z.object({
  nurej: z.string().min(1, "NUREJ es requerido."),
  clientName: z.string().min(1, "Nombre del cliente es requerido."),
  cause: z.string().min(1, "Causa es requerida."),
  processStage: z.string().min(1, "Etapa del proceso es requerida."),
  nextActivity: z.string().min(1, "Próxima actividad es requerida."),
  subject: z.enum(CASE_SUBJECTS_OPTIONS as [string, ...string[]], {
    errorMap: () => ({ message: "Materia es requerida." }),
  }),
  assignedLawyerId: z.string().optional(), 
});

export type CaseFormValues = z.infer<typeof caseFormSchema>;

interface CaseFormProps {
  initialData?: Case;
  onSave: (data: CaseFormValues & { reminders: Case['reminders'], documentLinks: Case['documentLinks'], assignedLawyerId?: string, organizationId?: string }, currentCase?: Case) => Promise<void>;
  onDelete?: (caseId: string) => Promise<void>;
  lawyersForAssignment?: User[]; // Pass list of lawyers for assignment dropdown
}

export function CaseForm({ initialData, onSave, onDelete, lawyersForAssignment = [] }: CaseFormProps) {
  const { isAdmin, isSecretary, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [reminders, setReminders] = useState<Case['reminders']>(initialData?.reminders || []);
  const [documentLinks, setDocumentLinks] = useState<Case['documentLinks']>(initialData?.documentLinks || []);

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: initialData
      ? {
          nurej: initialData.nurej,
          clientName: initialData.clientName,
          cause: initialData.cause,
          processStage: initialData.processStage,
          nextActivity: initialData.nextActivity,
          subject: initialData.subject,
          assignedLawyerId: initialData.assignedLawyerId || UNASSIGNED_LAWYER_VALUE, 
        }
      : {
          nurej: "",
          clientName: "",
          cause: "",
          processStage: "",
          nextActivity: "",
          subject: undefined,
          assignedLawyerId: UNASSIGNED_LAWYER_VALUE, 
        },
  });

  const canAssignLawyer = isAdmin || isSecretary;
  const canDeleteCase = isAdmin && !!initialData && !!onDelete;
  const isNurejReadOnly = !isAdmin && !!initialData;


  async function onSubmit(values: CaseFormValues) {
    setIsSaving(true);
    if (!currentUser?.organizationId && !initialData?.organizationId) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo determinar la organización para este caso." });
        setIsSaving(false);
        return;
    }
    try {
      const dataToSave = { ...values };
      if (dataToSave.assignedLawyerId === UNASSIGNED_LAWYER_VALUE) {
        dataToSave.assignedLawyerId = undefined;
      }

      const fullCaseData = {
        ...dataToSave,
        reminders,
        documentLinks,
        organizationId: initialData?.organizationId || currentUser?.organizationId,
      };
      await onSave(fullCaseData as any, initialData);
      toast({
        title: initialData ? "Caso Actualizado" : "Caso Creado",
        description: `El caso "${values.clientName}" ha sido ${initialData ? 'actualizado' : 'creado'} exitosamente.`,
      });
      router.push(initialData ? `/cases/${initialData.id}` : "/dashboard");
    } catch (error) {
      console.error("Error saving case:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Ocurrió un error al ${initialData ? 'actualizar' : 'crear'} el caso.`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialData || !onDelete || !isAdmin) return; // Ensure only admin can delete
    setIsDeleting(true);
    try {
      await onDelete(initialData.id);
      toast({
        title: "Caso Eliminado",
        description: `El caso "${initialData.clientName}" ha sido eliminado.`,
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: "No se pudo eliminar el caso.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const handleAddReminder = (reminder: Omit<Case['reminders'][0], 'id' | 'createdBy'> ) => {
    if(!currentUser?.id) return;
    setReminders(prev => [...prev, { ...reminder, id: `reminder-${Date.now()}`, createdBy: currentUser!.id }]);
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  };

  const handleAddDocumentLink = (docLink: Omit<Case['documentLinks'][0], 'id'>) => {
    setDocumentLinks(prev => [...prev, { ...docLink, id: `doc-${Date.now()}` }]);
  };

  const handleDeleteDocumentLink = (docLinkId: string) => {
    setDocumentLinks(prev => prev.filter(d => d.id !== docLinkId));
  };


  return (
    <Card className="shadow-xl max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {initialData ? "Editar Caso" : "Crear Nuevo Caso"}
        </CardTitle>
        <CardDescription>
          {initialData ? "Actualice los detalles del caso." : "Complete la información para registrar un nuevo caso."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nurej"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NUREJ (Número Único)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 202300101" {...field} readOnly={isNurejReadOnly} />
                    </FormControl>
                    {isNurejReadOnly && <FormDescription>Solo administradores pueden editar el NUREJ de un caso existente.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Causa / Motivo</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción breve de la causa o motivo del caso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="processStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etapa del Proceso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una etapa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROCESS_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materia</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la materia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CASE_SUBJECTS_OPTIONS.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nextActivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próxima Actividad Programada</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Audiencia preliminar, Presentar escrito" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canAssignLawyer && (
              <FormField
                control={form.control}
                name="assignedLawyerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abogado Asignado</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || UNASSIGNED_LAWYER_VALUE}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un abogado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED_LAWYER_VALUE}>Sin asignar</SelectItem>
                        {lawyersForAssignment.map((lawyer) => (
                          <SelectItem key={lawyer.id} value={lawyer.id}>
                            {lawyer.name} ({lawyer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {lawyersForAssignment.length === 0 && <FormDescription>No hay abogados en su organización para asignar.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-4 pt-6 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Recordatorios</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm"><CalendarPlus className="mr-2 h-4 w-4" /> Añadir Recordatorio</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Recordatorio</DialogTitle>
                    </DialogHeader>
                    <ReminderForm onAddReminder={handleAddReminder} />
                  </DialogContent>
                </Dialog>
              </div>
              {reminders.length > 0 ? (
                <ul className="space-y-2">
                  {reminders.map(reminder => (
                    <li key={reminder.id} className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{reminder.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(reminder.date), "Pp HH:mm", { locale: es })}
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteReminder(reminder.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay recordatorios para este caso.</p>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Documentos (Enlaces OneDrive)</h3>
                 <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Documento</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Enlace de Documento</DialogTitle>
                    </DialogHeader>
                    <DocumentLinkForm onAddLink={handleAddDocumentLink} />
                  </DialogContent>
                </Dialog>
              </div>
              {documentLinks.length > 0 ? (
                <ul className="space-y-2">
                  {documentLinks.map(doc => (
                    <li key={doc.id} className="flex justify-between items-center p-2 border rounded-md">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{doc.name}</a>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteDocumentLink(doc.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay documentos enlazados a este caso.</p>
              )}
            </div>
            
            <div className="flex justify-end gap-4 pt-8">
              {canDeleteCase && (
                 <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting || isSaving}
                    className="mr-auto"
                  >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Eliminar Caso
                  </Button>
              )}
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving || isDeleting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || isDeleting} className="min-w-[120px]">
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {initialData ? "Guardar Cambios" : "Crear Caso"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
