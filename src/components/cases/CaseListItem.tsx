"use client";

import type { Case, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit3, Trash2, User as UserIcon, CalendarDays, Briefcase, Milestone, Activity, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CaseListItemProps {
  caseItem: Case;
  assignedLawyer?: User;
}

export function CaseListItem({ caseItem, assignedLawyer }: CaseListItemProps) {
  const { isAdmin, isLawyer, isSecretary, currentUser } = useAuth();
  const { toast } = useToast();

  const canEdit = isAdmin || isSecretary || (isLawyer && caseItem.assignedLawyerId === currentUser?.id);
  const canDelete = isAdmin;

  const getTimestampDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') return format(parseISO(timestamp), "PPP", { locale: es });
    if (timestamp.toDate) return format(timestamp.toDate(), "PPP", { locale: es });
    return format(new Date(timestamp.seconds * 1000), "PPP", { locale: es });
  }

  const formattedLastActivityDate = getTimestampDate(caseItem.lastActivityDate);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "cases", caseItem.id));
      toast({ title: "Caso Eliminado", description: "El caso ha sido eliminado exitosamente." });
      // The parent component listening to the collection will automatically update the UI.
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el caso." });
    }
  };


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold text-primary">{caseItem.clientName}</CardTitle>
          <Badge variant={caseItem.subject === "Penal" ? "destructive" : "secondary"} className="capitalize">
            {caseItem.subject.toLowerCase()}
          </Badge>
        </div>
        <CardDescription>NUREJ: {caseItem.nurej}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <Briefcase className="mr-2 h-4 w-4 text-accent" />
          <strong>Causa:</strong> <span className="ml-1 truncate">{caseItem.cause}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Milestone className="mr-2 h-4 w-4 text-accent" />
          <strong>Etapa:</strong> <span className="ml-1">{caseItem.processStage}</span>
        </div>
         <div className="flex items-center text-sm text-muted-foreground">
          <Activity className="mr-2 h-4 w-4 text-accent" />
          <strong>Próx. Actividad:</strong> <span className="ml-1">{caseItem.nextActivity}</span>
        </div>
        {assignedLawyer && (
          <div className="flex items-center text-sm text-muted-foreground">
            <UserIcon className="mr-2 h-4 w-4 text-accent" />
            <strong>Abogado:</strong> <span className="ml-1">{assignedLawyer.name}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4 text-accent" />
          <strong>Últ. Actividad:</strong> <span className="ml-1">{formattedLastActivityDate}</span>
        </div>
        {caseItem.fileAttachments && caseItem.fileAttachments.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-2 h-4 w-4 text-accent" />
                <strong>Archivos:</strong> <span className="ml-1">{caseItem.fileAttachments.length}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/cases/${caseItem.id}`}>
            <Eye className="mr-1 h-4 w-4" /> Ver
          </Link>
        </Button>
        {canEdit && (
          <Button variant="default" size="sm" asChild>
            <Link href={`/cases/${caseItem.id}?edit=true`}>
              <Edit3 className="mr-1 h-4 w-4" /> Editar
            </Link>
          </Button>
        )}
        {canDelete && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-1 h-4 w-4" /> Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro de eliminar este caso?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El caso será eliminado permanentemente de la base de datos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
