
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, PlusCircle, Edit, Trash2, MoreVertical } from "lucide-react"; // Added MoreVertical
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
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";


export default function UsersPage() {
  const { isAdmin, isLoading: authIsLoading, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClientLoading, setIsClientLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin) {
        router.replace("/dashboard"); 
      } else {
        // Filter out the current admin user from the list if they are an admin,
        // Admins shouldn't typically delete or demote themselves via the main user list.
        setUsers(mockUsers.filter(u => u.id !== currentUser?.id || u.role !== UserRole.ADMIN));
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
      const userIndex = mockUsers.findIndex(u => u.id === userToDelete.id);
      if (userIndex > -1) {
        mockUsers.splice(userIndex, 1); // Remove from mock data source
      }
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id)); // Update local state
      toast({ title: "Usuario Eliminado", description: `El usuario ${userToDelete.name} ha sido eliminado.` });
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
              <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Usuario
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-6 w-6 text-primary" />
              Lista de Usuarios
            </CardTitle>
            <CardDescription>
              Total de usuarios: {users.length}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                <p className="text-lg">No hay otros usuarios para mostrar.</p>
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
                  {users.map((user) => (
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
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRequest(user)} 
                              className="flex items-center text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                              disabled={user.id === currentUser?.id && user.role === UserRole.ADMIN} // Prevent self-delete for admin
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
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

      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de eliminar a {userToDelete.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
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

