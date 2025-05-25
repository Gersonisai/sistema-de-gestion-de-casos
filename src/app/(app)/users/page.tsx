
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, PlusCircle, Edit, Trash2, MoreVertical, KeySquare } from "lucide-react"; 
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { mockUsers } from "@/data/mockData";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";


export default function UsersPage() {
  const { isAdmin, isLoading: authIsLoading, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClientLoading, setIsClientLoading] = useState(true);
  const [usersToList, setUsersToList] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin) {
        router.replace("/dashboard"); 
      } else {
        // In a multi-tenant app, an admin would only see users from their organization.
        // For this simulation, the `currentUser` (admin) sees other users within their `organizationId`.
        // The current `admin@lexcase.com` is a sort of "super admin" for now.
        // If we want strict organization scoping, this filter needs to be more robust.
        const orgId = currentUser?.organizationId;
        if (orgId) {
            setUsersToList(mockUsers.filter(u => u.organizationId === orgId && u.id !== currentUser?.id));
        } else {
            // Fallback for admin not associated with an org (should not happen with new flow)
            // or for a "super admin" view if we decide to implement that concept.
            // For now, if admin has no orgId, show all users except self.
            setUsersToList(mockUsers.filter(u => u.id !== currentUser?.id));
        }
        setIsClientLoading(false);
      }
    }
  }, [isAdmin, authIsLoading, router, currentUser]);

  const handleDeleteRequest = (user: User) => {
    if (user.id === currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Acción no permitida",
        description: "No puedes eliminar tu propia cuenta de administrador desde esta lista.",
      });
      return;
    }
    setUserToDelete(user);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      // TODO: In a real app, call Firebase Admin SDK to delete user from Firebase Auth.
      // For now, just remove from mockUsers.
      const userIndex = mockUsers.findIndex(u => u.id === userToDelete.id);
      if (userIndex > -1) {
        mockUsers.splice(userIndex, 1); 
      }
      setUsersToList(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id)); 
      toast({ title: "Usuario Eliminado (Simulación)", description: `El usuario ${userToDelete.name} ha sido eliminado de la lista local.` });
      setUserToDelete(null);
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return "Administrador";
      case UserRole.LAWYER: return "Abogado";
      default: return role;
    }
  };

  if (authIsLoading || isClientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <PageHeader 
        title="Gestión de Usuarios"
        actionButton={
          <Button asChild>
            <Link href="/users/new">
              <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Usuario (Abogado)
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-6 w-6 text-primary" />
              Lista de Usuarios
            </CardTitle>
            <CardDescription>
              Total de usuarios en su organización: {usersToList.length}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {usersToList.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                <p className="text-lg">No hay otros usuarios en su organización para mostrar.</p>
                <p className="text-sm">Puede crear nuevos usuarios (abogados) usando el botón de arriba.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersToList.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === UserRole.ADMIN ? "default" : "secondary"}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/users/${user.id}/edit`} className="flex items-center cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Editar Rol/Nombre
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRequest(user)} 
                              className="flex items-center text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                              disabled={user.id === currentUser?.id && user.role === UserRole.ADMIN}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for Invitation Code Management */}
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center">
                <KeySquare className="mr-2 h-6 w-6 text-primary" />
                Gestión de Invitaciones (Próximamente)
            </CardTitle>
             <CardDescription>
              Genere y gestione códigos de invitación para que los abogados se unan a su organización.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Esta funcionalidad permitirá generar códigos únicos que los abogados podrán usar para registrarse y
                unirse automáticamente a su consorcio, dentro de los límites de su plan de suscripción.
            </p>
            <Button disabled className="mt-4">Generar Código de Invitación (Simulación)</Button>
        </CardContent>
      </Card>


      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de eliminar a {userToDelete.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer (simulación). El usuario será eliminado de la lista local.
                En una aplicación real, esto también eliminaría al usuario de Firebase Authentication.
                Los casos asignados a este usuario (si es abogado) deberán ser reasignados manualmente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Eliminar Usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
