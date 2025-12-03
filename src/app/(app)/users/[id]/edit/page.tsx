"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserForm } from "@/components/users/UserForm";
import type { EditUserFormValues } from "@/components/users/UserForm";
import { PageHeader } from "@/components/shared/PageHeader";
import type { User as AppUser } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDocument } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";


function EditUserPageContent() {
  const routeParams = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin, currentUser, isLoading: authIsLoading } = useAuth();
  
  const userId: string | null = useMemo(() => {
    return typeof routeParams?.id === 'string' ? routeParams.id : null;
  }, [routeParams]);
  
  const userDocRef = useMemo(() => userId ? doc(db, "users", userId) : null, [userId]);
  const { data: userData, isLoading: userIsLoading, error } = useDocument<AppUser>(userDocRef);

  // Security Check
  useEffect(() => {
    if (!authIsLoading && !userIsLoading) {
        if (!isAdmin) {
            router.replace("/dashboard");
            return;
        }
        if (userData && currentUser?.organizationId !== userData.organizationId) {
            toast({ variant: "destructive", title: "Acceso Denegado", description: "No puede editar usuarios de otra organización." });
            router.replace("/users");
        }
    }
  }, [authIsLoading, userIsLoading, isAdmin, router, userData, currentUser?.organizationId, toast]);

  const handleSaveUser = async (data: EditUserFormValues, id?: string) => {
    if (!id) return { success: false, error: { message: "User ID is missing." } };
    
    try {
        const userRef = doc(db, "users", id);
        await updateDoc(userRef, {
            name: data.name,
            role: data.role,
        });
        return { success: true };
    } catch (e: any) {
        return { success: false, error: { message: e.message || "Failed to update user." } };
    }
  };

  if (authIsLoading || userIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData || error) {
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
      <UserForm initialData={userData} onSave={handleSaveUser as any} isEditMode={true} />
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
