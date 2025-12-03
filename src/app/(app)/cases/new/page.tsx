"use client";

import { CaseForm } from "@/components/cases/CaseForm";
import type { CaseFormValues } from "@/components/cases/CaseForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import type { Case, User, FileAttachment } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/hooks/use-firestore";

export default function NewCasePage() {
  const { isAdmin, isLawyer, isSecretary, isLoading: authIsLoading, currentUser } = useAuth();
  const router = useRouter();
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin && !isLawyer && !isSecretary) {
        router.replace("/dashboard"); 
      } else {
        setIsClientLoading(false);
      }
    }
  }, [isAdmin, isLawyer, isSecretary, authIsLoading, router]);

  const { data: users, isLoading: usersIsLoading } = useCollection<User>(collection(db, "users"));

  const handleSaveCase = async (data: CaseFormValues & { reminders: Case['reminders'], fileAttachments: FileAttachment[] }) => {
    if (!currentUser?.organizationId) {
      console.error("No organization ID found for current user.");
      return;
    }
    
    await addDoc(collection(db, "cases"), {
        ...data,
        organizationId: currentUser.organizationId,
        lastActivityDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reminders: data.reminders || [],
        fileAttachments: data.fileAttachments || [],
    });

    router.push("/dashboard");
  };
  
  if (authIsLoading || isClientLoading || usersIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const lawyersInOrg = currentUser?.organizationId 
    ? users?.filter(u => u.organizationId === currentUser.organizationId && u.role === UserRole.LAWYER)
    : [];

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Registrar Nuevo Caso Legal" />
      <CaseForm 
        onSave={handleSaveCase as any} 
        lawyersForAssignment={lawyersInOrg} 
      />
    </div>
  );
}
