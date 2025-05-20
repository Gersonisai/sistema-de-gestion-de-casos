
"use client";

import { UserForm } from "@/components/users/UserForm";
import type { CreateUserByAdminFormValues } from "@/components/users/UserForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
// import type { User } from "@/lib/types"; // App User type
// import { mockUsers } from "@/data/mockData"; // mockUsers is updated within UserForm/AuthContext for now

export default function NewUserPage() {
  const { isAdmin, isLoading: authIsLoading, register } = useAuth(); // Use register from AuthContext
  const router = useRouter();
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin) {
        router.replace("/dashboard"); 
      } else {
        setIsClientLoading(false);
      }
    }
  }, [isAdmin, authIsLoading, router]);

  // Admin creating a new user
  const handleSaveUser = async (data: CreateUserByAdminFormValues) => {
    // The register function from AuthContext now handles Firebase user creation
    // and the simulation of adding to mockUsers.
    // The role is passed from the form.
    const result = await register(data.name, data.email, data.password, data.role);
    return { ...result, newUserId: result.error ? undefined : "simulated-new-id-from-firebase-auth" }; // UserForm expects newUserId on success
    // In a real app with Firestore, the register function in AuthContext might return the actual new user ID from Firestore.
    // For now, UserForm handles toast/redirect.
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
      <PageHeader title="Crear Nuevo Usuario (Admin)" />
      <UserForm onSave={handleSaveUser as any} isEditMode={false} />
    </div>
  );
}
