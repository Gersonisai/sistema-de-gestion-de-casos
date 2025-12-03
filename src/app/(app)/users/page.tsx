"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, PlusCircle, Edit, Trash2, MoreVertical, KeySquare, Loader2, Copy } from "lucide-react"; 
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import type { User, Organization } from "@/lib/types";
import { UserRole, PLAN_LIMITS, USER_ROLE_NAMES } from "@/lib/types";
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
import { useCollection, useDocument } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { collection, query, where, doc, deleteDoc } from "firebase/firestore";

export default function UsersPage() {
  const { isAdmin, isLoading: authIsLoading, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  // Security check effect
  useEffect(() => {
    if (!authIsLoading && !isAdmin) {
      router.replace("/dashboard"); 
    }
  }, [isAdmin, authIsLoading, router]);

  // Fetch users of the current admin's organization
  const usersQuery = useMemo(() => {
    if (!currentUser?.organizationId) return null;
    return query(collection(db, "users"), where("organizationId", "==", currentUser.organizationId));
  }, [currentUser?.organizationId]);
  const { data: users, isLoading: usersIsLoading } = useCollection<User>(usersQuery);

  // Fetch organization details to check plan limits
  const orgDocRef = useMemo(() => {
    if (!currentUser?.organizationId) return null;
    return doc(db, "organizations", currentUser.organizationId);
  }, [currentUser?.organizationId]);
  const { data: organization, isLoading: orgIsLoading } = useDocument<Organization>(orgDocRef);
  
  const usersToList = useMemo(() => {
    return users?.filter(u => u.id !== currentUser?.id) || [];
  }, [users, currentUser?.id]);


  const handleDeleteRequest = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      // In a real app, this should call a Firebase Function to delete the user from Auth and their associated data.
      // For this prototype, we'll just delete the user document from Firestore.
      try {
        await deleteDoc(doc(db, "users", userToDelete.id));
        toast({ title: "Usuario Eliminado", description: `El usuario ${userToDelete.name} ha sido eliminado de Firestore.` });
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el usuario." });
      } finally {
        setUserToDelete(null);
      }
    }
  };

  const handleGenerateInvitationCode = () => {
    if (!currentUser || !organization) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo identificar la organización del administrador." });
      return;
    }

    const currentTeamCount = users?.filter(u => u.role === UserRole.LAWYER || u.role === UserRole.SECRETARY).length || 0;
    const planLimits = PLAN_LIMITS[organization.plan] || PLAN_LIMITS.trial_basic; 

    if (currentTeamCount >= planLimits.maxTeamMembers) { 
      toast({
        variant: "destructive",
        title: "Límite de Miembros del Equipo Alcanzado",
        description: `Su plan "${organization.plan}" permite un máximo de ${planLimits.maxTeamMembers} miembros. Ya ha alcanzado este límite.`,
      });
      return;
    }

    const orgIdPart = organization.id.substring(0, Math.min(organization.id.length, 8));
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `YASI-${orgIdPart}-${randomPart}`;
    
    setGeneratedCode(code);
    setShowCodeDialog(true);
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode).then(() => {
        toast({ title: "Copiado", description: "Código de invitación copiado al portapapeles." });
      }).catch(err => {
        toast({ variant: "destructive", title: "Error al copiar", description: "No se pudo copiar el código." });
        console.error('Error al copiar:', err);
      });
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    return USER_ROLE_NAMES[role] || role;
  };

  if (authIsLoading || usersIsLoading || orgIsLoading) {
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
      <Card className="shadow-lg mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-6 w-6 text-primary" />
              Lista de Usuarios de su Organización
            </CardTitle>
            <CardDescription>
              Total: {usersToList.length}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {usersToList.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                <p className="text-lg">No hay otros usuarios en su organización para mostrar.</p>
                <p className="text-sm">Puede crear nuevos usuarios usando el botón de arriba.</p>
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
                        <Badge variant={user.role === UserRole.ADMIN ? "default" : (user.role === UserRole.SECRETARY ? "outline" : "secondary")}>
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

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center">
                <KeySquare className="mr-2 h-6 w-6 text-primary" />
                Gestión de Invitaciones para Miembros del Equipo
            </CardTitle>
             <CardDescription>
              Genere códigos de invitación para que los abogados o secretarias se unan a su organización, dentro de los límites de su plan.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-4">
                Esta funcionalidad permitirá generar códigos únicos que los miembros del equipo podrán usar para registrarse y
                unirse automáticamente a su consorcio.
            </p>
            <Button onClick={handleGenerateInvitationCode}>Generar Código de Invitación</Button>
        </CardContent>
      </Card>


      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de eliminar a {userToDelete.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará la cuenta del usuario de forma permanente. Los casos asignados a este usuario (si es abogado) deberán ser reasignados manualmente. Esta acción no se puede deshacer.
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

      {generatedCode && (
        <AlertDialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Código de Invitación Generado</AlertDialogTitle>
              <AlertDialogDescription>
                Comparta este código con el miembro del equipo que desea invitar a su organización:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 p-3 bg-muted rounded-md flex items-center justify-between">
                <span className="text-lg font-mono text-foreground">{generatedCode}</span>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copiar código">
                    <Copy className="h-5 w-5"/>
                </Button>
            </div>
             <p className="text-xs text-muted-foreground">
                El miembro del equipo deberá ingresar este código en la página de inicio de sesión, usando la opción "Unirse con Código de Invitación".
                Este código es para un solo uso (simulación) y es válido para un abogado o secretaria.
            </p>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => { setGeneratedCode(null); setShowCodeDialog(false); }}>Entendido</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
