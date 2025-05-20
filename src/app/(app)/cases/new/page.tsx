"use client";

import { CaseForm } from "@/components/cases/CaseForm";
import type { CaseFormValues } from "@/components/cases/CaseForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mockCases } from "@/data/mockData"; // To simulate adding to a list
import { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function NewCasePage() {
  const { isAdmin, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin) {
        router.replace("/dashboard"); // Redirect if not admin
      } else {
        setIsClientLoading(false);
      }
    }
  }, [isAdmin, authIsLoading, router]);


  const handleSaveCase = async (data: CaseFormValues & { reminders: any[], documentLinks: any[] }) => {
    // In a real app, this would be an API call.
    // For this mock, we'll just log it and add to a local (non-persistent) list or simulate.
    console.log("New case data:", data);
    const newCase = {
      id: `case-${Date.now()}`,
      ...data,
      lastActivityDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCases.push(newCase); // This won't persist across page loads, just for demo
    // router.push("/dashboard"); // Navigation is handled by CaseForm itself on success
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
      <PageHeader title="Registrar Nuevo Caso Legal" />
      <CaseForm onSave={handleSaveCase as any} />
    </div>
  );
}
