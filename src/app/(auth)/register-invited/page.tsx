
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
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Loader2, UserPlus, KeySquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { UserRole, PLAN_LIMITS } from "@/lib/types";
import { mockOrganizations, mockUsers } from "@/data/mockData";

const INVITATION_CODE_PREFIX = "YASI-";

const formSchema = z.object({
  invitationCode: z.string()
    .min(1, { message: "El código de invitación es requerido." })
    .refine(value => value.startsWith(INVITATION_CODE_PREFIX) && value.length > INVITATION_CODE_PREFIX.length + 5, { // Basic format check
      message: "Formato de código de invitación inválido."
    }),
  name: z.string().min(3, { message: "Su nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "Confirme su contraseña." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type RegisterInvitedFormValues = z.infer<typeof formSchema>;

export default function RegisterInvitedPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<RegisterInvitedFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invitationCode: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterInvitedFormValues) {
    setIsLoading(true);
    setErrorMessage(null);

    // Simulate extracting organizationId from code
    // Example: YASI-org_def-ABCD -> org_def
    const parts = values.invitationCode.split('-');
    let simulatedOrgId: string | undefined = undefined;
    if (parts.length >= 2 && parts[0] === "YASI") {
        // This is a very basic simulation. A real system would validate the code against a DB.
        simulatedOrgId = parts[1]; 
    }

    if (!simulatedOrgId) {
      setErrorMessage("Código de invitación inválido o no se pudo determinar la organización.");
      toast({ variant: "destructive", title: "Error de Código", description: "El código de invitación no es válido." });
      setIsLoading(false);
      return;
    }
    
    const targetOrganization = mockOrganizations.find(org => org.id.startsWith(simulatedOrgId));
    if (!targetOrganization) {
        setErrorMessage(`Organización asociada al código no encontrada (ID simulado: ${simulatedOrgId}).`);
        toast({ variant: "destructive", title: "Error de Código", description: "Organización no encontrada para este código." });
        setIsLoading(false);
        return;
    }

    // Check team member limit for the organization
    const currentTeamMembersCount = mockUsers.filter(u => u.organizationId === targetOrganization.id && (u.role === UserRole.LAWYER || u.role === UserRole.SECRETARY)).length;
    const planLimits = PLAN_LIMITS[targetOrganization.plan] || PLAN_LIMITS.trial_basic;

    if (currentTeamMembersCount >= planLimits.maxTeamMembers) {
      setErrorMessage(`La organización "${targetOrganization.name}" ha alcanzado el límite de ${planLimits.maxTeamMembers} miembros para su plan "${targetOrganization.plan}".`);
      toast({
        variant: "destructive",
        title: "Límite de Usuarios Alcanzado",
        description: `La organización asociada a este código ha alcanzado su límite de miembros. Contacte al administrador.`,
        duration: 7000,
      });
      setIsLoading(false);
      return;
    }
    
    const result = await register(
      values.name,
      values.email,
      values.password,
      UserRole.LAWYER, // Invited users default to lawyer, could be selectable
      targetOrganization.id // Associate with the "validated" organization
    );
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "¡Registro Exitoso!",
        description: `Bienvenido/a ${values.name}. Su cuenta ha sido creada y asociada a la organización. Ahora puede iniciar sesión.`,
        duration: 7000,
      });
      router.push("/login"); 
    } else {
      let specificError = "Ocurrió un error durante el registro.";
      if (result.error?.code === "auth/email-already-in-use") {
        specificError = "Este correo electrónico ya está registrado para otra cuenta.";
        form.setError("email", { type: "manual", message: specificError });
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

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <KeySquare className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Registrarse con Código de Invitación</CardTitle>
          <CardDescription>
            Complete el formulario para unirse a una organización en YASI K'ARI usando su código.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Invitación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: YASI-ORGID-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Su Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Laura Gómez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Su Email</FormLabel>
                    <FormControl>
                      <Input placeholder="suemail@ejemplo.com" {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Su Contraseña</FormLabel>
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
                Registrarse y Unirse
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            ¿Ya tiene una cuenta?{" "}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
              Inicie sesión aquí
            </Link>
             <span className="mx-2">|</span>
            <Link href="/subscribe" className="underline text-primary hover:text-primary/80">
              Crear nueva organización
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

    