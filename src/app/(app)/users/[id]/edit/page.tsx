
"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserForm } from "@/components/users/UserForm";
import type { EditUserFormValues } from "@/components/users/UserForm";
import { PageHeader } from "@/components/shared/PageHeader";
import type { User as AppUser } from "@/lib/types"; // App User type
import { mockUsers } from "@/data/mockData"; // For fetching initial data and updating local mock list
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Firebase Admin SDK would be needed on a backend to truly edit Firebase Auth user properties like role (via custom claims) or name.
// This frontend form will primarily update the local mockData for UI reflection.
// Real user profile updates (name, role) should go to a Firestore database.

function EditUserPageContent() {
  const routeParams = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authIsLoading } = useAuth();
  
  const [currentUserData, setCurrentUserData] = useState<AppUser | null | undefined>(undefined);
  const [isClientLoading, setIsClientLoading] = useState(true);

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
        if (routeParams && isClientLoading) {
            setCurrentUserData(null);
        }
        setIsClientLoading(false);
        return;
      }
      
      // In a real app with Firebase, you'd fetch user profile from Firestore using userId (which is Firebase UID)
      const foundUser = mockUsers.find((u) => u.id === userId);
      setCurrentUserData(foundUser || null);
      setIsClientLoading(false);
    }
  }, [userId, isAdmin, authIsLoading, router, routeParams, isClientLoading]);


  const handleSaveUser = async (data: EditUserFormValues, id?: string) => {
    // This function is called by UserForm.
    // In a real app, you'd update the user's profile in Firestore here.
    // Firebase Auth user properties (like email, password) are typically changed via specific Firebase Auth SDK methods, not a general form.
    // Roles would be updated in Firestore or via custom claims (backend).
    if (!id) return { success: false, error: { message: "User ID is missing." } };
    
    console.log("Attempting to update user (mock):", id, data);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            name: data.name,
            // Email is readonly and should not be changed here
            role: data.role, // Role update is simulated in mockUsers
        };
        console.log("Updated mock user data:", mockUsers[userIndex]);
        return { success: true };
    }
    return { success: false, error: { message: "User not found in mock data for update." } };
  };

  if (authIsLoading || isClientLoading || (isAdmin && currentUserData === undefined && userId)) {
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

