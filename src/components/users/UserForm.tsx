
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
import type { User } from "@/lib/types"; // App User type
import { UserRole, USER_ROLE_NAMES } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/useAuth"; // Not needed here directly for form logic
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { mockUsers } from "@/data/mockData"; 

// Schema for creating users (by admin)
const createUserSchemaByAdmin = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Email inválido."),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "El rol es requerido." }),
  }),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirme la contraseña."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

// Schema for editing users
const editUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Email inválido."), 
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "El rol es requerido." }),
  }),
});

export type CreateUserByAdminFormValues = z.infer<typeof createUserSchemaByAdmin>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;


interface UserFormProps {
  initialData?: User; 
  onSave: (data: CreateUserByAdminFormValues | EditUserFormValues, userId?: string) => Promise<{success: boolean, error?: any, newUserId?: string}>;
  isEditMode: boolean;
}

export function UserForm({ initialData, onSave, isEditMode }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formSchema = isEditMode ? editUserSchema : createUserSchemaByAdmin;

  const form = useForm<CreateUserByAdminFormValues | EditUserFormValues>({
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
          role: UserRole.LAWYER, 
          password: "",
          confirmPassword: "",
        },
  });

  async function onSubmit(values: CreateUserByAdminFormValues | EditUserFormValues) {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const result = await onSave(values, initialData?.id);

      if (result.success) {
        toast({
          title: isEditMode ? "Usuario Actualizado" : "Usuario Creado",
          description: `El usuario "${values.name}" ha sido ${isEditMode ? 'actualizado' : 'creado'} exitosamente.`,
        });
        
        // Update mockUsers for immediate UI reflection
        if (isEditMode && initialData) {
            const index = mockUsers.findIndex(u => u.id === initialData.id);
            if (index !== -1) {
                mockUsers[index] = { 
                  ...mockUsers[index], 
                  name: values.name, 
                  role: values.role, 
                  // email is not changed in edit mode
                };
            }
        } else if (!isEditMode && result.newUserId) {
            const userExists = mockUsers.some(u => u.id === result.newUserId);
            if (!userExists) {
                mockUsers.push({
                    id: result.newUserId,
                    name: values.name,
                    email: values.email,
                    role: values.role,
                    organizationId: initialData?.organizationId, // Or determine based on admin creating it
                });
            }
        }
        router.push("/users");
      } else {
        let specificError = `Ocurrió un error al ${isEditMode ? 'actualizar' : 'crear'} el usuario.`;
        if (result.error?.code === "auth/email-already-in-use" && !isEditMode) {
          specificError = "Este correo electrónico ya está en uso por otro usuario.";
          form.setError("email", { type: "manual", message: specificError });
        } else if (result.error?.message) {
          specificError = result.error.message;
        }
        setErrorMessage(specificError);
        toast({ variant: "destructive", title: "Error", description: specificError });
      }
    } catch (error: any) {
      console.error("Error saving user (UserForm):", error);
      setErrorMessage(`Error inesperado: ${error.message || 'Por favor, intente de nuevo.'}`);
      toast({
        variant: "destructive",
        title: "Error Inesperado",
        description: `Ocurrió un error inesperado.`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="shadow-xl max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario (Admin)"}
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
                  <Select onValueChange={(value) => field.onChange(value as UserRole)} value={field.value as string | undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.LAWYER}>{USER_ROLE_NAMES[UserRole.LAWYER]}</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>{USER_ROLE_NAMES[UserRole.ADMIN]}</SelectItem>
                      <SelectItem value={UserRole.SECRETARY}>{USER_ROLE_NAMES[UserRole.SECRETARY]}</SelectItem>
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
            
            {errorMessage && (
              <p className="text-sm font-medium text-destructive">{errorMessage}</p>
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
