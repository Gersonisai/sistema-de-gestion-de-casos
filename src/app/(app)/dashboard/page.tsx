
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
import { PlusCircle, Search, Filter, Briefcase, BellRing, Users as UsersIcon, ArrowDownUp, ArrowUpDown, Settings, FolderPlus } from "lucide-react";
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

const ALL_SUBJECTS_FILTER_KEY = "ALL_SUBJECTS_FILTER_KEY_VALUE"; // Ensure this is not an empty string

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
  const { currentUser, isAdmin, isLawyer } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>(ALL_SUBJECTS_FILTER_KEY);
  const [sortField, setSortField] = useState<SortField>("lastActivityDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    let userCases = initialMockCases;
    if (currentUser?.role === UserRole.LAWYER) {
      userCases = initialMockCases.filter(c => c.assignedLawyerId === currentUser.id);
    }
    setCases(userCases);
  }, [currentUser]);

  const filteredCases = useMemo(() => {
    let sortedCases = [...cases]
      .filter(c => 
        (c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         c.nurej.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.cause.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (subjectFilter === ALL_SUBJECTS_FILTER_KEY || c.subject === subjectFilter)
      );

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
        default: return 0;
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
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
    
    let chartData: { name: string; count: number; }[] = [];
    if (isUserAdmin) {
      const relevantCasesForChart = initialMockCases; // Admins see all cases in chart
      const casesBySubjectData = relevantCasesForChart.reduce((acc, currentCaseItem) => {
        const subject = currentCaseItem.subject;
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {} as Record<CaseSubject, number>);
      chartData = CASE_SUBJECTS_OPTIONS.map(subject => ({
        name: subject,
        count: casesBySubjectData[subject] || 0,
      })).filter(item => item.count > 0);
    }


    return {
      primaryStatCount,
      primaryStatTitle,
      upcomingRemindersCount,
      totalLawyersCount,
      chartData
    };
  }, [cases, isAdmin]);

  const chartConfig = {
    count: { label: "Casos", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const NavCard = ({ href, icon: Icon, title, description, adminOnly = false, lawyerAndAdmin = false }: { href: string, icon: React.ElementType, title: string, description: string, adminOnly?: boolean, lawyerAndAdmin?: boolean }) => {
    if (adminOnly && !isAdmin) return null;
    if (lawyerAndAdmin && !isAdmin && !isLawyer) return null; // Show if lawyer OR admin
    
    return (
      <Link href={href} className="block hover:shadow-lg transition-shadow rounded-lg">
        <Card className="shadow-md h-full cursor-pointer hover:border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Panel de Control YASI K'ARI" />

      {/* Stats Cards */}
      <h2 className="text-xl font-semibold mb-3 text-foreground">Resumen General</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Link href="/dashboard#case-list-section" className="block hover:shadow-lg transition-shadow rounded-lg">
          <Card className="shadow-md h-full cursor-pointer hover:border-primary">
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
        </Link>
        <Link href="/reminders" className="block hover:shadow-lg transition-shadow rounded-lg">
            <Card className="shadow-md h-full cursor-pointer hover:border-primary">
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
        </Link>
        {isAdmin && stats.totalLawyersCount !== undefined && (
          <Link href="/users" className="block hover:shadow-lg transition-shadow rounded-lg">
            <Card className="shadow-md h-full cursor-pointer hover:border-primary">
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
          </Link>
        )}
      </div>

      {/* Navigation Cards - Conditional Rendering based on Role */}
      {(isAdmin || isLawyer) && (
        <>
          <h2 className="text-xl font-semibold mb-3 mt-8 text-foreground">Acciones y Navegación</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <NavCard
                href="/cases/new"
                icon={FolderPlus}
                title="Registrar Nuevo Caso"
                description="Crear una nueva ficha de caso legal."
                lawyerAndAdmin={true} // Visible for lawyers and admins
            />
            {isAdmin && ( // Only admins see these
              <>
                <NavCard
                    href="/users"
                    icon={UsersIcon}
                    title="Gestionar Usuarios"
                    description="Administrar cuentas de abogados y administradores."
                    adminOnly={true}
                />
                 <NavCard
                    href="/settings"
                    icon={Settings}
                    title="Configuración"
                    description="Personalizar preferencias de la aplicación."
                    adminOnly={true} 
                />
              </>
            )}
          </div>
        </>
      )}
      
      {/* Chart for Cases by Subject - Admin Only */}
      {isAdmin && stats.chartData.length > 0 && (
        <Card className="shadow-md mb-6 mt-8">
          <CardHeader>
            <CardTitle>Casos por Materia</CardTitle>
            <CardDescription>Distribución de los casos visibles según su materia.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.chartData} accessibilityLayer margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} interval={0} angle={stats.chartData.length > 5 ? -30 : 0} textAnchor={stats.chartData.length > 5 ? "end" : "middle"} height={stats.chartData.length > 5 ? 50 : 30} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters, Search, and Sort Section */}
      <div className="mb-6 p-4 border rounded-lg bg-card shadow mt-8" id="case-list-section">
        <h3 className="text-lg font-semibold mb-4">Filtrar y Ordenar Casos</h3>
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
                <SelectItem value={ALL_SUBJECTS_FILTER_KEY}>Todas las Materias</SelectItem>
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
      
      <h2 className="text-xl font-semibold mb-4 mt-8 text-foreground">{isAdmin ? "Listado General de Casos" : "Mis Casos Asignados"}</h2>
      <CaseList cases={filteredCases} setCases={setCases} />
    </div>
  );
}

