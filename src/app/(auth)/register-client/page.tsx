
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
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { UserRole } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(3, { message: "Su nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  location: z.string().min(3, { message: "Por favor, ingrese su ciudad y país."}),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "Confirme su contraseña." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type RegisterClientFormValues = z.infer<typeof formSchema>;

export default function RegisterClientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<RegisterClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      location: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterClientFormValues) {
    setIsLoading(true);
    setErrorMessage(null);

    // El registro de cliente no tiene organizationId
    const result = await register(
      values.name,
      values.email,
      values.password,
      UserRole.CLIENT,
      undefined // No organizationId for clients
    );
    setIsLoading(false);

    if (result.success && result.newUserId) {
      toast({
        title: "¡Registro Exitoso!",
        description: `Bienvenido/a, ${values.name}. Su cuenta ha sido creada. Ahora será redirigido a su panel.`,
        duration: 7000,
      });
      // El `AuthContext` actualizará el `currentUser` y el `AppLayout` redirigirá al dashboard
      router.push("/dashboard"); 
    } else {
      let specificError = "Ocurrió un error durante el registro.";
      if (result.error?.code === "auth/email-already-in-use") {
        specificError = "Este correo electrónico ya está registrado. Por favor, inicie sesión.";
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
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Crear Cuenta de Cliente</CardTitle>
          <CardDescription>
            El registro es gratuito y le permitirá encontrar al abogado perfecto para su caso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Su Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Carla Soto" {...field} />
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación (Ciudad, País)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Madrid, España" {...field} />
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
                Crear Mi Cuenta
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
    </main>
  );
}
