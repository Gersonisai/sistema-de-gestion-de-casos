
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import type { Reminder, Case } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { CalendarPlus, CalendarIcon as LucideCalendarIcon } from "lucide-react"; // Renamed to avoid conflict
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const globalReminderFormSchema = z.object({
  caseId: z.string().min(1, "Debe seleccionar un caso."),
  date: z.date({ required_error: "La fecha es requerida." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)."),
  message: z.string().min(1, "El mensaje del recordatorio es requerido."),
});

type GlobalReminderFormValues = z.infer<typeof globalReminderFormSchema>;

interface GlobalReminderFormProps {
  cases: Case[];
  onSave: (reminderData: Omit<Reminder, "id" | "createdBy">, caseId: string) => void;
  onClose: () => void;
}

export function GlobalReminderForm({ cases, onSave, onClose }: GlobalReminderFormProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<GlobalReminderFormValues>({
    resolver: zodResolver(globalReminderFormSchema),
    defaultValues: {
      caseId: "",
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      message: "",
    },
  });

  function onSubmit(values: GlobalReminderFormValues) {
    if (!currentUser) {
        toast({ variant: "destructive", title: "Error", description: "Usuario no autenticado."});
        return;
    }
    if (!values.caseId) {
        form.setError("caseId", { message: "Debe seleccionar un caso." });
        return;
    }

    const [hours, minutes] = values.time.split(':').map(Number);
    const combinedDateTime = new Date(values.date);
    combinedDateTime.setHours(hours, minutes, 0, 0);

    onSave(
      {
        date: combinedDateTime.toISOString(),
        message: values.message,
      },
      values.caseId
    );
    
    toast({
        title: "Recordatorio Añadido",
        description: "El nuevo recordatorio ha sido añadido exitosamente al caso seleccionado.",
    });
    form.reset({
      caseId: "",
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      message: "",
    });
    onClose(); // Close the dialog
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="caseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un caso" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.clientName} ({c.nurej})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <LucideCalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hora</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje del Recordatorio</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del recordatorio..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          <CalendarPlus className="mr-2 h-4 w-4" /> Añadir Recordatorio
        </Button>
      </form>
    </Form>
  );
}
