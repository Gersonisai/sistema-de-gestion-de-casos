"use client";

import type { Case } from "@/lib/types";
import { CaseListItem } from "./CaseListItem";
import { Briefcase, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCollection } from "@/hooks/use-firestore";
import { collection, query, where, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CaseListProps {
  cases?: Case[];
}

export function CaseList({ cases }: CaseListProps) {
  const { currentUser, isLawyer, isLoading: authIsLoading } = useAuth();
  
  const usersQuery = useMemo(() => {
    if (!currentUser?.organizationId) return null;
    return query(collection(db, "users"), where("organizationId", "==", currentUser.organizationId));
  }, [currentUser?.organizationId]);

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  if (authIsLoading || usersLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!cases || cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-border rounded-lg bg-card">
        <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground">No hay casos para mostrar.</h2>
        <p className="text-muted-foreground mt-2">
          Comience creando un nuevo caso o verifique los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cases.map((caseItem) => {
            const assignedLawyer = users?.find(u => u.id === caseItem.assignedLawyerId);
            return <CaseListItem key={caseItem.id} caseItem={caseItem} assignedLawyer={assignedLawyer} />;
        })}
      </div>
    </>
  );
}
