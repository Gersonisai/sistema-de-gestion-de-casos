
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { mockUsers } from "@/data/mockData"; // Import mockUsers to add to it
import { UserRole } from "@/lib/types"; // Import UserRole
import type { User } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "Confirme su contraseña." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"], // Set error on confirmPassword field
});

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // Simulate backend registration delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists in mockUsers (simulating unique email check)
    const emailExists = mockUsers.some(user => user.email === values.email);
    if (emailExists) {
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: "Este correo electrónico ya está registrado. Por favor, intente con otro.",
      });
      form.setError("email", { type: "manual", message: "Este correo electrónico ya está en uso." });
      setIsLoading(false);
      return;
    }
    
    // Simulate adding user to mock data (this is not persistent)
    const newUser: User = {
      id: `user-${Date.now()}`, // Simple unique ID generation for mock
      name: values.name,
      email: values.email,
      // For this simulation, new users are registered as LAWYER.
      // A real app might have role selection or default to a less privileged role.
      role: UserRole.LAWYER, 
      // Password is not stored in mockUsers, it's only checked by the mock login function
    };
    mockUsers.push(newUser);
    console.log("Mock user added:", newUser);
    console.log("Current mockUsers:", mockUsers);


    setIsLoading(false);
    toast({
      title: "Registro Exitoso",
      description: "Su cuenta ha sido creada. Ahora puede iniciar sesión.",
    });
    router.push("/login");
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">Crear Cuenta</CardTitle>
        <CardDescription className="text-center">
          Complete el formulario para registrarse en YASI K'ARI.
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
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
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
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Contraseña</FormLabel>
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Registrarse
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
