
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, UploadCloud, FileText } from "lucide-react";

const idTypes = [
  { value: "carnet", label: "Carnet de Identidad" },
  { value: "licencia", label: "Licencia de Conducir" },
  { value: "pasaporte", label: "Pasaporte" },
  { value: "registro_abogado", label: "Registro de Abogado" },
];

export default function VerifyIdentityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [idType, setIdType] = useState<string>("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!idType || !idFile) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor, seleccione un tipo de documento y adjunte el archivo.",
      });
      setIsLoading(false);
      return;
    }

    // Simulación de subida y verificación
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Simulating ID Verification:", { idType, fileName: idFile.name });

    toast({
      title: "Documento Recibido (Simulación)",
      description: "Su documento ha sido recibido para verificación. Será redirigido para crear su cuenta.",
      duration: 5000,
    });
    
    // Redirigir a la página de registro de organización para la prueba gratuita
    router.push("/register-organization?plan=trial_basic"); 
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <PageHeader title="Verificación de Identidad" />
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl">Prueba Gratuita - Verificación</CardTitle>
          <CardDescription>
            Para acceder a su prueba gratuita de 30 días del Plan Básico, por favor, complete este paso de verificación.
            Esto nos ayuda a prevenir el abuso del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="idType">Tipo de Documento</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger id="idType">
                  <SelectValue placeholder="Seleccione un tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  {idTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idFile">Adjuntar Documento (Foto o PDF)</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {idFile ? (
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="idFile-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                    >
                      <span>{idFile ? 'Cambiar archivo' : 'Subir un archivo'}</span>
                      <Input 
                        id="idFile-upload" 
                        name="idFile-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={(e) => setIdFile(e.target.files ? e.target.files[0] : null)}
                        accept="image/*,.pdf"
                      />
                    </label>
                    {!idFile && <p className="pl-1">o arrastrar y soltar</p>}
                  </div>
                  {idFile ? (
                    <p className="text-xs text-gray-500">{idFile.name}</p>
                  ) : (
                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB; PDF hasta 5MB</p>
                  )}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Enviar para Verificación"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-xs text-muted-foreground">
            Su información se manejará con confidencialidad. Este paso es solo para la prueba gratuita.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
