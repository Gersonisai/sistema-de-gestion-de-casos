
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
import { useState } from "react";
import { Loader2, LogIn, UserPlus, KeySquare, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor ingrese un email válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export function LoginForm() {
  const { login, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setErrorMessage(null);
    const success = await login(values.email, values.password);
    setIsLoading(false);
    if (success) {
      toast({ title: "Inicio de Sesión Exitoso", description: "Bienvenido a YASI K'ARI." });
      // El useEffect en el layout se encargará de la redirección al dashboard
      router.push("/dashboard");
    } else {
      const firebaseErrorMsg = "Email o contraseña incorrectos, o la cuenta no existe. Verifique sus credenciales.";
      setErrorMessage(firebaseErrorMsg);
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: firebaseErrorMsg,
      });
      form.setError("password", { type: "manual", message: " " }); 
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary mt-4">YASI K'ARI</CardTitle>
        <CardDescription>
          Ingrese a su cuenta o regístrese.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Input placeholder="••••••••" {...field} type="password" />
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
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Iniciar Sesión
            </Button>
          </form>
        </Form>
         <Separator className="my-6" />
         <div className="space-y-4 text-center">
            <div>
                <p className="text-sm text-muted-foreground mb-2">¿Es un cliente buscando ayuda legal?</p>
                <Button variant="default" className="w-full" asChild>
                    <Link href="/register-client">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Regístrese Gratis como Cliente
                    </Link>
                </Button>
            </div>
            <div>
                <p className="text-sm text-muted-foreground mb-2">¿Es un profesional o bufete legal?</p>
                 <Button variant="outline" className="w-full" asChild>
                    <Link href="/subscribe">
                        <Shield className="mr-2 h-4 w-4" />
                        Crear Consorcio o Iniciar Prueba
                    </Link>
                </Button>
            </div>
            <div>
                <p className="text-sm text-muted-foreground mb-2">¿Recibió un código de invitación?</p>
                 <Button variant="secondary" className="w-full" asChild>
                    <Link href="/register-invited">
                        <KeySquare className="mr-2 h-4 w-4" />
                        Unirse a un Consorcio
                    </Link>
                </Button>
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
