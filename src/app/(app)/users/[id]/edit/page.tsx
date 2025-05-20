
"use client";

import { useEffect, useState, Suspense } from "react";
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
  const params = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authIsLoading } = useAuth();
  
  const [currentUserData, setCurrentUserData] = useState<User | null | undefined>(undefined); // undefined for loading, null for not found
  const [isClientLoading, setIsClientLoading] = useState(true);

  const userId = params.id as string;

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin) {
        router.replace("/dashboard");
      } else {
        const foundUser = mockUsers.find((u) => u.id === userId);
        setCurrentUserData(foundUser || null);
        setIsClientLoading(false);
      }
    }
  }, [userId, isAdmin, authIsLoading, router]);


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

  if (authIsLoading || isClientLoading || currentUserData === undefined) {
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
          El usuario que está buscando no existe o ha sido eliminado.
        </p>
        <Button asChild className="mt-6">
          <Link href="/users">Volver a Usuarios</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Editar Usuario" />
      <UserForm initialData={currentUserData} onSave={handleSaveUser as any} isEditMode={true} />
    </div>
  );
}

export default function EditUserPage() {
  return (
    // Suspense boundary is good practice if any child component uses useSearchParams, etc.
    // Not strictly necessary here but doesn't hurt.
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <EditUserPageContent />
    </Suspense>
  );
}
