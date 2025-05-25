
"use client";

import { UserForm } from "@/components/users/UserForm";
import type { CreateUserByAdminFormValues } from "@/components/users/UserForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/lib/types"; // Import UserRole

export default function NewUserPage() {
  const { isAdmin, isLoading: authIsLoading, register, currentUser } = useAuth();
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

  const handleSaveUser = async (data: CreateUserByAdminFormValues) => {
    if (!currentUser || !currentUser.organizationId) {
        // This should ideally not happen if an admin is logged in
        return { success: false, error: { message: "Administrador no asociado a una organización." } };
    }
    // Admin creating a new user for their own organization
    return register(data.name, data.email, data.password, data.role, currentUser.organizationId);
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
      <PageHeader title="Crear Nuevo Usuario para su Organización" />
      <UserForm onSave={handleSaveUser as any} isEditMode={false} />
    </div>
  );
}
