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
import type { DocumentLink } from "@/lib/types";
import { PlusCircle, Link2 } from "lucide-react";

const documentLinkFormSchema = z.object({
  name: z.string().min(1, "El nombre del documento es requerido."),
  url: z.string().url("Debe ser una URL válida (ej: https://onedrive.live.com/...)."),
});

type DocumentFormValues = z.infer<typeof documentLinkFormSchema>;

interface DocumentLinkFormProps {
  onAddLink: (link: Omit<DocumentLink, "id">) => void;
}

export function DocumentLinkForm({ onAddLink }: DocumentLinkFormProps) {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentLinkFormSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  function onSubmit(values: DocumentFormValues) {
    onAddLink(values);
    form.reset();
    // Consider closing dialog here
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Documento</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Demanda Inicial.pdf" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Documento (OneDrive)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://onedrive.live.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          <Link2 className="mr-2 h-4 w-4" /> Añadir Enlace
        </Button>
      </form>
    </Form>
  );
}
