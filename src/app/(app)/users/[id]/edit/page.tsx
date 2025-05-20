
"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserForm } from "@/components/users/UserForm";
import type { EditUserFormValues } from "@/components/users/UserForm";
import { PageHeader } from "@/components/shared/PageHeader";
import type { User } from "@/lib/types";
import { mockUsers } from "@/data/mockData"; 
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function EditUserPageContent() {
  const routeParams = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authIsLoading } = useAuth();
  
  const [currentUserData, setCurrentUserData] = useState<User | null | undefined>(undefined); // undefined for loading, null for not found
  const [isClientLoading, setIsClientLoading] = useState(true); // Retained for clarity on initial data fetch simulation

  const userId: string | null = useMemo(() => {
    return typeof routeParams?.id === 'string' ? routeParams.id : null;
  }, [routeParams]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin) {
        router.replace("/dashboard");
        return;
      }
      if (!userId) {
         // If params are available but no valid userId, set to null (not found)
        if (routeParams && isClientLoading) { // Check isClientLoading to prevent setting to null if params just not ready
            setCurrentUserData(null);
        }
        setIsClientLoading(false); // Done checking, even if no valid id
        return;
      }
      
      const foundUser = mockUsers.find((u) => u.id === userId);
      setCurrentUserData(foundUser || null);
      setIsClientLoading(false);
    }
  }, [userId, isAdmin, authIsLoading, router, routeParams, isClientLoading]);


  const handleSaveUser = async (data: EditUserFormValues, id?: string) => {
    // In a real app, this would be an API call.
    if (!id) return;
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            name: data.name,
            // Email is readonly and should not be changed here
            role: data.role,
        };
    }
    console.log("Updated user data:", data, "for user:", id);
    // Navigation and toast are handled by UserForm
  };

  if (authIsLoading || isClientLoading || (isAdmin && currentUserData === undefined && userId)) {
    // Show loader if auth is loading, or if client is loading initial user data (and userId is present, meaning we expect data)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (currentUserData === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold">Usuario No Encontrado</h2>
        <p className="text-muted-foreground mt-2">
          El usuario que está buscando no existe, no tiene un ID válido en la URL o ha sido eliminado.
        </p>
        <Button asChild className="mt-6">
          <Link href="/users">Volver a Usuarios</Link>
        </Button>
      </div>
    );
  }
  
  // If still loading but it's not an admin or no userId was passed, it might be redirecting, don't render form
  if (!currentUserData && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Editar Usuario" />
      {currentUserData && <UserForm initialData={currentUserData} onSave={handleSaveUser as any} isEditMode={true} />}
    </div>
  );
}

export default function EditUserPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <EditUserPageContent />
    </Suspense>
  );
}
