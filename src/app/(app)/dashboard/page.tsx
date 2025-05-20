"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { CaseList } from "@/components/cases/CaseList";
import type { Case } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { mockCases as initialMockCases } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CASE_SUBJECTS_OPTIONS } from "@/lib/types";


export default function DashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");

  useEffect(() => {
    // Simulate fetching cases. In a real app, this would be an API call.
    // Filter cases based on user role
    let userCases = initialMockCases;
    if (currentUser?.role === UserRole.LAWYER) {
      userCases = initialMockCases.filter(c => c.assignedLawyerId === currentUser.id);
    }
    
    // Sort by lastActivityDate (most recent first)
    userCases.sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime());
    setCases(userCases);
  }, [currentUser]);

  const filteredCases = useMemo(() => {
    return cases
      .filter(c => 
        (c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         c.nurej.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.cause.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (subjectFilter === "" || c.subject === subjectFilter)
      )
      .sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime());
  }, [cases, searchTerm, subjectFilter]);

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Panel de Casos"
        actionButton={
          isAdmin ? (
            <Button asChild className="shadow-md">
              <Link href="/cases/new">
                <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Caso
              </Link>
            </Button>
          ) : null
        }
      />
      
      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Buscar por cliente, NUREJ, causa..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full">
                <Filter className="mr-2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las Materias</SelectItem>
                {CASE_SUBJECTS_OPTIONS.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <CaseList cases={filteredCases} setCases={setCases} />
    </div>
  );
}
