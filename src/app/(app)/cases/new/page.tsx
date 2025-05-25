
"use client";

import { CaseForm } from "@/components/cases/CaseForm";
import type { CaseFormValues } from "@/components/cases/CaseForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mockCases, mockUsers } from "@/data/mockData"; 
import type { Case, FileAttachment } from "@/lib/types"; // Added FileAttachment
import { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function NewCasePage() {
  const { isAdmin, isLawyer, isSecretary, isLoading: authIsLoading, currentUser } = useAuth();
  const router = useRouter();
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading) {
      // Allow if admin, lawyer, OR secretary
      if (!isAdmin && !isLawyer && !isSecretary) {
        router.replace("/dashboard"); 
      } else {
        setIsClientLoading(false);
      }
    }
  }, [isAdmin, isLawyer, isSecretary, authIsLoading, router]);


  const handleSaveCase = async (data: CaseFormValues & { reminders: Case['reminders'], fileAttachments: FileAttachment[] }) => {
    if (!currentUser?.organizationId) {
      console.error("No organization ID found for current user.");
      // Potentially show a toast message to the user
      return;
    }
    
    const newCase: Case = {
      id: `case-${Date.now()}`,
      ...data,
      organizationId: currentUser.organizationId, // Associate with current user's organization
      lastActivityDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure reminders and fileAttachments are correctly passed
      reminders: data.reminders || [],
      fileAttachments: data.fileAttachments || [],
    };
    mockCases.push(newCase); 
    console.log("New case data:", newCase);
  };
  
  if (authIsLoading || isClientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const lawyersInOrg = currentUser?.organizationId 
    ? mockUsers.filter(u => u.organizationId === currentUser.organizationId && u.role === UserRole.LAWYER)
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
