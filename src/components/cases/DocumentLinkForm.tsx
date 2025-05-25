
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FileAttachment } from "@/lib/types";
import { UploadCloud, Paperclip, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// Schema for individual file (though we handle multiple files, each will be validated similarly)
const fileSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, "Por favor, seleccione un archivo."),
  // Add more specific file validations if needed (e.g., size, type)
  // Example: .refine(file => file.size < 5 * 1024 * 1024, "El archivo no debe exceder 5MB")
  // Example: .refine(file => ["application/pdf", "image/jpeg"].includes(file.type), "Tipo de archivo no soportado")
});

type FileUploadFormValues = {
    files: File[];
};

const fileUploadFormSchema = z.object({
    files: z.array(z.custom<File>((val) => val instanceof File)).min(1, "Debe seleccionar al menos un archivo."),
});


interface FileUploadFormProps {
  onAddAttachments: (attachments: Omit<FileAttachment, "id" | "uploadedAt" | "gcsPath">[]) => void;
  caseId: string; // Needed for simulating GCS path and API call
}

export function DocumentLinkForm({ onAddAttachments, caseId }: FileUploadFormProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<FileUploadFormValues>({
    resolver: zodResolver(fileUploadFormSchema),
    defaultValues: {
      files: [],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      form.setValue("files", [...selectedFiles, ...newFiles], { shouldValidate: true });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    form.setValue("files", newFiles, { shouldValidate: true });
  };

  async function onSubmit(values: FileUploadFormValues) {
    if (!currentUser || !currentUser.organizationId) {
      toast({ variant: "destructive", title: "Error", description: "Usuario o organización no identificados." });
      return;
    }
    if (values.files.length === 0) {
      toast({ variant: "destructive", title: "Sin archivos", description: "Por favor, seleccione al menos un archivo para subir." });
      return;
    }

    setIsUploading(true);
    const attachmentsToAdd: Omit<FileAttachment, "id" | "uploadedAt" | "gcsPath">[] = [];
    let successfulUploads = 0;

    for (const file of values.files) {
      // Simulate API call to get signed URL
      console.log(`[FRONTEND SIMULATION] Requesting signed URL for: ${file.name}, type: ${file.type}, caseId: ${caseId}, tenantId: ${currentUser.organizationId}`);
      // const backendPayload = {
      //   casoId: caseId,
      //   tipo: "documentos", // Or derive from context if needed
      //   nombre: file.name,
      //   type: file.type,
      //   tenantId: currentUser.organizationId, // Simulating tenantId
      // };
      // In a real app: const { uploadUrl } = await fetch('/api/generate-upload-url', { method: 'POST', body: JSON.stringify(backendPayload) }).then(res => res.json());
      const simulatedUploadUrl = `https://storage.googleapis.com/simulated-bucket/${currentUser.organizationId}/${caseId}/${file.name}`;
      console.log(`[FRONTEND SIMULATION] Received simulated signed URL: ${simulatedUploadUrl}`);

      // Simulate direct GCS upload
      console.log(`[FRONTEND SIMULATION] Uploading ${file.name} to ${simulatedUploadUrl} via PUT...`);
      // In a real app: await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      console.log(`[FRONTEND SIMULATION] Successfully "uploaded" ${file.name}`);
      attachmentsToAdd.push({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });
      successfulUploads++;
    }
    
    if (attachmentsToAdd.length > 0) {
        onAddAttachments(attachmentsToAdd);
    }

    setIsUploading(false);
    if (successfulUploads > 0) {
      toast({
        title: "Archivos Procesados",
        description: `${successfulUploads} archivo(s) "subidos" y añadidos al caso (simulación).`,
      });
      form.reset({ files: [] });
      setSelectedFiles([]);
    } else {
      toast({
        variant: "destructive",
        title: "Error de Subida",
        description: "No se pudo simular la subida de ningún archivo.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seleccionar Archivos</FormLabel>
              <FormControl>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload-input"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>Subir archivos</span>
                        <Input 
                          id="file-upload-input" 
                          type="file" 
                          className="sr-only" 
                          multiple
                          onChange={handleFileChange}
                          accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" // Example file types
                        />
                      </label>
                      <p className="pl-1">o arrastrar y soltar</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, Imágenes, Documentos Office, TXT. Hasta 10MB por archivo (simulado).</p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedFiles.length > 0 && (
            <div className="space-y-2">
                <FormLabel>Archivos seleccionados:</FormLabel>
                <ul className="list-disc pl-5 space-y-1 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                        <li key={index} className="text-sm flex justify-between items-center">
                            <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-destructive hover:text-destructive/80">
                                X
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        <Button type="submit" className="w-full" disabled={isUploading || selectedFiles.length === 0}>
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="mr-2 h-4 w-4" />
          )}
          {isUploading ? "Subiendo Archivos..." : `Adjuntar ${selectedFiles.length > 0 ? selectedFiles.length : ''} Archivo(s)`}
        </Button>
        <FormDescription className="text-xs text-center">
          Este es un sistema de subida simulado. Los archivos no se almacenarán permanentemente.
        </FormDescription>
      </form>
    </Form>
  );
}
