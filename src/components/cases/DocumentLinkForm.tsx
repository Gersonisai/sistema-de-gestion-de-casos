
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
import type { DocumentLink } from "@/lib/types";
import { Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const documentLinkFormSchema = z.object({
  name: z.string().min(1, "El nombre del documento es requerido."),
  urls: z.string().min(1, "Debe ingresar al menos una URL.").refine(value => {
    const lines = value.split('\n').map(line => line.trim()).filter(line => line !== '');
    return lines.length > 0;
  }, "Debe ingresar al menos una URL válida en las líneas proporcionadas."),
});

type DocumentFormValues = z.infer<typeof documentLinkFormSchema>;

interface DocumentLinkFormProps {
  onAddLink: (link: Omit<DocumentLink, "id">) => void;
}

export function DocumentLinkForm({ onAddLink }: DocumentLinkFormProps) {
  const { toast } = useToast();
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentLinkFormSchema),
    defaultValues: {
      name: "",
      urls: "",
    },
  });

  function onSubmit(values: DocumentFormValues) {
    const urlsInput = values.urls;
    const individualUrls = urlsInput.split('\n')
      .map(u => u.trim())
      .filter(u => u); // Filtra líneas vacías

    let addedCount = 0;
    let invalidCount = 0;

    if (individualUrls.length === 0) {
      form.setError("urls", { message: "Por favor ingrese al menos una URL válida." });
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se ingresaron URLs válidas.",
      });
      return;
    }

    individualUrls.forEach(singleUrl => {
      try {
        // Validar si es una URL de OneDrive (o cualquier URL válida)
        // Podríamos ser más estrictos con regex si solo queremos URLs de OneDrive
        new URL(singleUrl); 
        if (!singleUrl.startsWith("http://") && !singleUrl.startsWith("https://")) {
            throw new Error("URL debe empezar con http:// o https://");
        }
        onAddLink({ name: values.name, url: singleUrl });
        addedCount++;
      } catch (e) {
        console.warn(`URL inválida omitida: ${singleUrl}`, e);
        invalidCount++;
      }
    });

    if (addedCount > 0) {
      toast({
        title: "Enlaces Añadidos",
        description: `${addedCount} enlace(s) añadido(s) correctamente.${invalidCount > 0 ? ` ${invalidCount} URL(s) inválida(s) fueron omitidas.` : ''}`,
      });
    } else if (invalidCount > 0) {
      toast({
        variant: "destructive",
        title: "Error de URL",
        description: `Ninguna de las ${invalidCount + addedCount} URLs ingresadas era válida o tenía el formato correcto. Asegúrese que empiecen con http:// o https://.`,
      });
    }

    if (addedCount > 0) {
        form.reset();
        // El diálogo debería cerrarse automáticamente si este formulario está en un Dialog de ShadCN
        // y no hay errores que lo prevengan.
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Documento/Grupo de Enlaces</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Pruebas Adicionales" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="urls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URLs de Documentos (OneDrive, una por línea)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="https://onedrive.live.com/...\nhttps://sharepoint.com/..." 
                  {...field} 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          <Link2 className="mr-2 h-4 w-4" /> 
          {form.getValues("urls").split('\n').filter(u => u.trim()).length > 1 ? "Añadir Enlaces" : "Añadir Enlace"}
        </Button>
      </form>
    </Form>
  );
}
