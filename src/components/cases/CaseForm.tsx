
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
import type { Case, User, FileAttachment } from "@/lib/types";
import { CASE_SUBJECTS_OPTIONS, PROCESS_STAGES, UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Trash2, PlusCircle, CalendarPlus, Download, FileText } from "lucide-react";
import React, { useState } from "react";
import { ReminderForm } from "./ReminderForm";
import { DocumentLinkForm } from "./DocumentLinkForm"; // Now FileUploadForm
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
  onSave: (data: CaseFormValues & { reminders: Case['reminders'], fileAttachments: Case['fileAttachments'], assignedLawyerId?: string, organizationId?: string }, currentCase?: Case) => Promise<void>;
  onDelete?: (caseId: string) => Promise<void>;
  lawyersForAssignment?: User[];
}

export function CaseForm({ initialData, onSave, onDelete, lawyersForAssignment = [] }: CaseFormProps) {
  const { isAdmin, isSecretary, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [reminders, setReminders] = useState<Case['reminders']>(initialData?.reminders || []);
  const [fileAttachments, setFileAttachments] = useState<Case['fileAttachments']>(initialData?.fileAttachments || []);

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
        fileAttachments,
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
    if (!initialData || !onDelete || !isAdmin) return;
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

  const handleAddAttachments = (newAttachments: Omit<FileAttachment, "id" | "uploadedAt" | "gcsPath">[]) => {
    const processedAttachments: FileAttachment[] = newAttachments.map(att => ({
      ...att,
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, // Unique ID
      gcsPath: `tenants/${currentUser?.organizationId || 'unknown_org'}/casos/${initialData?.id || 'new_case'}/${att.fileName}`, // Simulated GCS Path
      uploadedAt: new Date().toISOString(),
    }));
    setFileAttachments(prev => [...prev, ...processedAttachments]);
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setFileAttachments(prev => prev.filter(d => d.id !== attachmentId));
  };

  const handleSimulatedDownload = (attachment: FileAttachment) => {
    console.log(`[FRONTEND SIMULATION] Requesting download URL for: ${attachment.fileName} from path: ${attachment.gcsPath}`);
    // In a real app: const { downloadUrl } = await fetch('/api/generate-download-url', { method: 'POST', body: JSON.stringify({ filePath: attachment.gcsPath }) }).then(res => res.json());
    // window.open(downloadUrl, '_blank');
    toast({
      title: "Descarga Simulada",
      description: `Se iniciaría la descarga de "${attachment.fileName}". (URL firmada no implementada en backend).`,
    });
     // Simulate opening a placeholder
    window.open(`https://placehold.co/300x200.png?text=Simulated+Download+of+${attachment.fileName}`, "_blank");
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Case details fields */}
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

            {/* Reminders Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Recordatorios</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm"><CalendarPlus className="mr-2 h-4 w-4" /> Añadir</Button>
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
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteReminder(reminder.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay recordatorios para este caso.</p>
              )}
            </div>

            {/* File Attachments Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Archivos Adjuntos</h3>
                 <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Adjuntar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adjuntar Nuevos Archivos</DialogTitle>
                    </DialogHeader>
                    <DocumentLinkForm 
                        onAddAttachments={handleAddAttachments} 
                        caseId={initialData?.id || "new-case-placeholder"}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              {fileAttachments.length > 0 ? (
                <ul className="space-y-2">
                  {fileAttachments.map(attachment => (
                    <li key={attachment.id} className="flex justify-between items-center p-3 border rounded-md bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{attachment.fileName}</span>
                        {attachment.size && <span className="text-xs text-muted-foreground flex-shrink-0">({(attachment.size / 1024).toFixed(1)} KB)</span>}
                      </div>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleSimulatedDownload(attachment)} title="Descargar (Simulado)">
                            <Download className="h-4 w-4"/>
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteAttachment(attachment.id)} title="Eliminar Archivo">
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay archivos adjuntos a este caso.</p>
              )}
            </div>
            
            <div className="flex justify-end gap-4 pt-6">
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
                {initialData ? "Guardar" : "Crear Caso"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
