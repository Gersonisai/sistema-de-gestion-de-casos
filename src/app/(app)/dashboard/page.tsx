
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { CaseList } from "@/components/cases/CaseList";
import type { Case, CaseSubject } from "@/lib/types";
import { UserRole, CASE_SUBJECTS_OPTIONS } from "@/lib/types";
import { mockCases as initialMockCases, mockUsers } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { PlusCircle, Search, Filter, Briefcase, BellRing, Users as UsersIcon, ArrowDownUp, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { isFuture, isToday, parseISO } from "date-fns";

type SortField = "lastActivityDate" | "clientName" | "nurej" | "createdAt";
type SortDirection = "asc" | "desc";

const sortOptions: { value: SortField; label: string }[] = [
  { value: "lastActivityDate", label: "Fecha Última Actividad" },
  { value: "clientName", label: "Nombre Cliente" },
  { value: "nurej", label: "NUREJ" },
  { value: "createdAt", label: "Fecha Creación" },
];

const sortDirectionOptions: { value: SortDirection; label: string }[] = [
  { value: "desc", label: "Descendente" },
  { value: "asc", label: "Ascendente" },
];


export default function DashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("lastActivityDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    let userCases = initialMockCases;
    if (currentUser?.role === UserRole.LAWYER) {
      userCases = initialMockCases.filter(c => c.assignedLawyerId === currentUser.id);
    }
    // Initial sort can be removed here, as it's handled by filteredCases
    setCases(userCases);
  }, [currentUser]);

  const filteredCases = useMemo(() => {
    let sortedCases = [...cases]
      .filter(c => 
        (c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         c.nurej.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.cause.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (subjectFilter === "ALL" || c.subject === subjectFilter)
      );

    // Sorting logic
    sortedCases.sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case "clientName":
        case "nurej":
          valA = a[sortField].toLowerCase();
          valB = b[sortField].toLowerCase();
          break;
        case "lastActivityDate":
        case "createdAt":
          valA = new Date(a[sortField]).getTime();
          valB = new Date(b[sortField]).getTime();
          break;
        default: // Should not happen
          return 0;
      }

      if (valA < valB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
    
    return sortedCases;
  }, [cases, searchTerm, subjectFilter, sortField, sortDirection]);

  const stats = useMemo(() => {
    const isUserAdmin = isAdmin;

    const primaryStatCount = isUserAdmin ? initialMockCases.length : cases.length;
    const primaryStatTitle = isUserAdmin ? "Total de Casos (Sistema)" : "Mis Casos Asignados";

    const relevantCasesForReminders = isUserAdmin ? initialMockCases : cases;
    const upcomingRemindersCount = relevantCasesForReminders.reduce((acc, currentCaseItem) => {
      const upcoming = currentCaseItem.reminders.filter(r => {
        const reminderDate = parseISO(r.date);
        return isFuture(reminderDate) || isToday(reminderDate);
      }).length;
      return acc + upcoming;
    }, 0);

    const totalLawyersCount = isUserAdmin ? mockUsers.filter(u => u.role === UserRole.LAWYER).length : undefined;

    const relevantCasesForChart = isUserAdmin ? initialMockCases : cases;
    const casesBySubjectData = relevantCasesForChart.reduce((acc, currentCaseItem) => {
      const subject = currentCaseItem.subject;
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {} as Record<CaseSubject, number>);

    const chartData = CASE_SUBJECTS_OPTIONS.map(subject => ({
      name: subject,
      count: casesBySubjectData[subject] || 0,
    })).filter(item => item.count > 0);

    return {
      primaryStatCount,
      primaryStatTitle,
      upcomingRemindersCount,
      totalLawyersCount,
      chartData
    };
  }, [cases, isAdmin, initialMockCases, mockUsers]);

  const chartConfig = {
    count: {
      label: "Casos",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stats.primaryStatTitle}</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.primaryStatCount}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Total de casos registrados en el sistema" : "Casos actualmente bajo su responsabilidad"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recordatorios Próximos</CardTitle>
            <BellRing className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingRemindersCount}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Recordatorios próximos para todos los casos" : "Sus recordatorios para los próximos días"}
            </p>
          </CardContent>
        </Card>
        {isAdmin && stats.totalLawyersCount !== undefined && (
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Abogados</CardTitle>
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLawyersCount}</div>
              <p className="text-xs text-muted-foreground">
                Abogados registrados en el sistema
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Chart for Cases by Subject */}
      {stats.chartData.length > 0 && (
        <Card className="shadow-md mb-6">
          <CardHeader>
            <CardTitle>Casos por Materia</CardTitle>
            <CardDescription>Distribución de los casos visibles según su materia.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.chartData} accessibilityLayer margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    interval={0}
                    angle={stats.chartData.length > 5 ? -30 : 0}
                    textAnchor={stats.chartData.length > 5 ? "end" : "middle"}
                    height={stats.chartData.length > 5 ? 50 : 30}

                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters, Search, and Sort Section */}
      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
                <SelectItem value="ALL_SUBJECTS_FILTER_KEY">Todas las Materias</SelectItem>
                {CASE_SUBJECTS_OPTIONS.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
              <SelectTrigger className="w-full">
                <ArrowUpDown className="mr-2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
              <SelectTrigger className="w-full">
                <ArrowDownUp className="mr-2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Dirección" />
              </SelectTrigger>
              <SelectContent>
                {sortDirectionOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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

