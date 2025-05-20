
"use client";

import { UserForm } from "@/components/users/UserForm";
import type { CreateUserFormValues } from "@/components/users/UserForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mockUsers } from "@/data/mockData";
import { Loader2 } from "lucide-react";
import type { User } from "@/lib/types";

export default function NewUserPage() {
  const { isAdmin, isLoading: authIsLoading } = useAuth();
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

  const handleSaveUser = async (data: CreateUserFormValues) => {
    // In a real app, this would be an API call.
    // For this mock, we'll just log it and add to a local (non-persistent) list.
    // Password is not stored in mockUser, just validated in form.
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    mockUsers.push(newUser); 
    console.log("New user data:", newUser);
    // Navigation and toast are handled by UserForm
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
      <PageHeader title="Crear Nuevo Usuario" />
      <UserForm onSave={handleSaveUser as any} isEditMode={false} />
    </div>
  );
}
