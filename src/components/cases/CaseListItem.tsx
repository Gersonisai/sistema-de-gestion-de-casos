
"use client";

import type { Case } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit3, Trash2, User as UserIcon, CalendarDays, Briefcase, Milestone, Activity, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { mockUsers } from "@/data/mockData"; 

interface CaseListItemProps {
  caseItem: Case;
  onDelete: (caseId: string) => void;
}

export function CaseListItem({ caseItem, onDelete }: CaseListItemProps) {
  const { isAdmin, isLawyer, isSecretary, currentUser } = useAuth();
  const assignedLawyer = mockUsers.find(u => u.id === caseItem.assignedLawyerId);

  const canEdit = isAdmin || isSecretary || (isLawyer && caseItem.assignedLawyerId === currentUser?.id);
  const canDelete = isAdmin;

  const formattedLastActivityDate = caseItem.lastActivityDate 
    ? format(parseISO(caseItem.lastActivityDate), "PPP", { locale: es })
    : "N/A";

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
        {caseItem.fileAttachments.length > 0 && ( // Updated from documentLinks
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
          <Button variant="destructive" size="sm" onClick={() => onDelete(caseItem.id)}>
            <Trash2 className="mr-1 h-4 w-4" /> Eliminar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
