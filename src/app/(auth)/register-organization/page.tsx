
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react"; // Added React for JSX
import { Loader2, Building, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
// UserRole no es necesario importar aquí ya que se usa indirectamente via AuthContext

const formSchema = z.object({
  organizationName: z.string().min(3, { message: "El nombre de la organización debe tener al menos 3 caracteres." }),
  adminName: z.string().min(3, { message: "Su nombre debe tener al menos 3 caracteres." }),
  adminEmail: z.string().email({ message: "Por favor ingrese un email válido." }),
  adminPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "Confirme su contraseña." }),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type RegisterOrganizationFormValues = z.infer<typeof formSchema>;

function RegisterOrganizationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { registerOrganizationAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) {
      setSelectedPlan(plan);
    } else {
      // Esto se ejecutará si 'plan' no está en los searchParams después de que Suspense resuelva
      toast({ variant: "destructive", title: "Error", description: "No se ha especificado un plan. Por favor, seleccione un plan primero." });
      router.replace("/subscribe"); // Usar replace para no añadir al historial
    }
  }, [searchParams, router, toast]);

  const form = useForm<RegisterOrganizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterOrganizationFormValues) {
    if (!selectedPlan) {
        toast({ variant: "destructive", title: "Error", description: "Plan no seleccionado." });
        return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    
    const result = await registerOrganizationAdmin(
      values.organizationName,
      values.adminName,
      values.adminEmail,
      values.adminPassword,
      selectedPlan
    );
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "¡Organización Registrada Exitosamente!",
        description: `Su organización "${values.organizationName}" y su cuenta de administrador han sido creadas. Ahora puede iniciar sesión.`,
        duration: 7000,
      });
      router.push("/login"); 
    } else {
      let specificError = "Ocurrió un error durante el registro de la organización.";
      if (result.error?.code === "auth/email-already-in-use") {
        specificError = "Este correo electrónico ya está registrado para otra cuenta.";
        form.setError("adminEmail", { type: "manual", message: specificError });
      } else if (result.error?.message) {
        specificError = result.error.message;
      }
      setErrorMessage(specificError);
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: specificError,
      });
    }
  }
  
  if (!selectedPlan) {
    // Esto se mostrará brevemente mientras useEffect redirige si el plan no se encuentra
    // o si el componente se renderiza antes de que searchParams esté disponible (manejado por Suspense)
    return (
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
    );
  }

  return (
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <Building className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Registrar Nueva Organización</CardTitle>
          <CardDescription>
            Complete el formulario para crear su consorcio en YASI K'ARI y su cuenta de administrador.
            <br /> Plan seleccionado: <span className="font-semibold capitalize">{selectedPlan.replace('_', ' ')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Organización/Bufete</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Bufete Legal YASI K'ARI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Su Nombre Completo (Administrador)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Alex Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Su Email (Administrador)</FormLabel>
                    <FormControl>
                      <Input placeholder="suemail@ejemplo.com" {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Su Contraseña (Administrador)</FormLabel>
                    <FormControl>
                      <Input placeholder="Mínimo 6 caracteres" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input placeholder="Repita su contraseña" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errorMessage && (
                <p className="text-sm font-medium text-destructive">{errorMessage}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Crear Organización y Cuenta Admin
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            ¿Ya tiene una cuenta?{" "}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
              Inicie sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
  );
}


export default function RegisterOrganizationPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4">Cargando...</p>
        </div>
      }>
        <RegisterOrganizationFormContent />
      </Suspense>
    </main>
  );
}
