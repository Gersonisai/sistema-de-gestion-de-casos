
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";

const baseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Email inválido."),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "El rol es requerido." }),
  }),
});

const createUserSchema = baseSchema.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirme la contraseña."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

const editUserSchema = baseSchema; // Email might be readonly but still part of the form values

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;
export type UserFormSubmitValues = CreateUserFormValues | EditUserFormValues;


interface UserFormProps {
  initialData?: User;
  onSave: (data: UserFormSubmitValues, userId?: string) => Promise<void>;
  isEditMode: boolean;
}

export function UserForm({ initialData, onSave, isEditMode }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const formSchema = isEditMode ? editUserSchema : createUserSchema;

  const form = useForm<UserFormSubmitValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
        }
      : {
          name: "",
          email: "",
          role: undefined,
          password: "",
          confirmPassword: "",
        },
  });

  async function onSubmit(values: UserFormSubmitValues) {
    setIsSaving(true);
    try {
      await onSave(values, initialData?.id);
      toast({
        title: isEditMode ? "Usuario Actualizado" : "Usuario Creado",
        description: `El usuario "${values.name}" ha sido ${isEditMode ? 'actualizado' : 'creado'} exitosamente.`,
      });
      router.push("/users");
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Ocurrió un error al ${isEditMode ? 'actualizar' : 'crear'} el usuario.`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="shadow-xl max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </CardTitle>
        <CardDescription>
          {isEditMode ? "Actualice los detalles del usuario." : "Complete la información para registrar un nuevo usuario."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ana Pérez" {...field} />
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
                    <Input placeholder="ej: usuario@dominio.com" {...field} type="email" readOnly={isEditMode} />
                  </FormControl>
                  {isEditMode && <FormDescription>El email no puede ser modificado.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.LAWYER}>Abogado</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode && (
              <>
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
                        <Input placeholder="Repita la contraseña" {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push('/users')} disabled={isSaving}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="min-w-[150px]">
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditMode ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
