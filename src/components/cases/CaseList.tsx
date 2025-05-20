"use client";

import type { Case } from "@/lib/types";
import { CaseListItem } from "./CaseListItem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";

interface CaseListProps {
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>; // To update state after deletion
}

export function CaseList({ cases, setCases }: CaseListProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteRequest = (caseId: string) => {
    setCaseToDelete(caseId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (caseToDelete) {
      // In a real app, this would be an API call
      setCases(prevCases => prevCases.filter(c => c.id !== caseToDelete));
      toast({ title: "Caso Eliminado", description: "El caso ha sido eliminado exitosamente." });
    }
    setShowDeleteDialog(false);
    setCaseToDelete(null);
  };

  if (cases.length === 0) {
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
        {cases.map((caseItem) => (
          <CaseListItem key={caseItem.id} caseItem={caseItem} onDelete={handleDeleteRequest} />
        ))}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este caso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El caso será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCaseToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
