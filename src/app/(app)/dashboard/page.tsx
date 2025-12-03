"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { CaseList } from "@/components/cases/CaseList";
import type { Case, CaseSubject, User } from "@/lib/types";
import { UserRole, CASE_SUBJECTS_OPTIONS } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { PlusCircle, Search, Filter, Briefcase, BellRing, Users as UsersIcon, ArrowDownUp, ArrowUpDown, Settings, FolderPlus, Building, Loader2 } from "lucide-react";
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
import { ClientDashboard } from "@/components/marketplace/ClientDashboard";
import { useCollection } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";

type SortField = "lastActivityDate" | "clientName" | "nurej" | "createdAt";
type SortDirection = "asc" | "desc";

const ALL_SUBJECTS_FILTER_KEY = "ALL_SUBJECTS_FILTER_KEY_VALUE"; 

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
  const { currentUser, isAdmin, isLawyer, isSecretary, isClient, isLoading: authIsLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>(ALL_SUBJECTS_FILTER_KEY);
  const [sortField, setSortField] = useState<SortField>("lastActivityDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Firestore data fetching
  const casesQuery = useMemo(() => {
    if (!currentUser) return null;
    if (isClient) return null; // Clients don't see this list

    let q = query(collection(db, "cases"), where("organizationId", "==", currentUser.organizationId));
    if (isLawyer) {
        q = query(q, where("assignedLawyerId", "==", currentUser.id));
    }
    return q;
  }, [currentUser, isClient, isLawyer]);

  const { data: cases, isLoading: casesIsLoading, error: casesError } = useCollection<Case>(casesQuery);
  const { data: users, isLoading: usersIsLoading } = useCollection<User>(
    currentUser?.organizationId ? query(collection(db, "users"), where("organizationId", "==", currentUser.organizationId)) : null
  );

  const filteredCases = useMemo(() => {
    if (!cases) return [];

    let sortedCases = [...cases]
      .filter(c => 
        (c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         c.nurej.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.cause.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (subjectFilter === ALL_SUBJECTS_FILTER_KEY || c.subject === subjectFilter)
      );

    const getTimestampDate = (timestamp: any): number => {
        if (!timestamp) return 0;
        if (typeof timestamp === 'string') return new Date(timestamp).getTime();
        if (timestamp.toDate) return timestamp.toDate().getTime();
        return new Date(timestamp.seconds * 1000).getTime();
    }

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
          valA = getTimestampDate(a[sortField]);
          valB = getTimestampDate(b[sortField]);
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
    if (isClient || !cases || !users) return {};

    const isUserAdminOrSecretary = isAdmin || isSecretary;
    
    const primaryStatCount = cases.length;
    let primaryStatTitle = isUserAdminOrSecretary ? "Total Casos (Organización)" : "Mis Casos Asignados";

    const upcomingRemindersCount = cases.reduce((acc, currentCaseItem) => {
      if (!currentCaseItem.reminders) return acc;
      const upcoming = currentCaseItem.reminders.filter(r => {
        const reminderDate = parseISO(r.date);
        return isFuture(reminderDate) || isToday(reminderDate);
      }).length;
      return acc + upcoming;
    }, 0);
    
    const totalTeamMembersCount = users?.filter(u => (u.role === UserRole.LAWYER || u.role === UserRole.SECRETARY)).length;
    
    let chartData: { name: string; count: number; }[] = [];
    if (isUserAdminOrSecretary && cases) {
      const casesBySubjectData = cases.reduce((acc, currentCaseItem) => {
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
      totalTeamMembersCount,
      chartData
    };
  }, [cases, users, isAdmin, isSecretary, isClient]);

  const chartConfig = {
    count: { label: "Casos", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const NavCard = ({ href, icon: Icon, title, description, allowedRoles }: { href: string, icon: React.ElementType, title: string, description: string, allowedRoles: UserRole[] }) => {
    if (!currentUser?.role || !allowedRoles.includes(currentUser.role)) return null;
    
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

  if (authIsLoading || (casesIsLoading && !isClient) || (usersIsLoading && !isClient)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isClient) {
    return <ClientDashboard />;
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Panel de Control YASI K'ARI" />

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
                {isAdmin || isSecretary ? "Casos activos en su organización" : "Casos actualmente bajo su responsabilidad"}
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
                        {isAdmin || isSecretary ? "Recordatorios próximos para su organización" : "Sus recordatorios para los próximos días"}
                    </p>
                </CardContent>
            </Card>
        </Link>
        {isAdmin && stats.totalTeamMembersCount !== undefined && (
          <Link href="/users" className="block hover:shadow-lg transition-shadow rounded-lg">
            <Card className="shadow-md h-full cursor-pointer hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miembros del Equipo</CardTitle>
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTeamMembersCount}</div>
                <p className="text-xs text-muted-foreground">
                  Abogados y Secretarias en su organización
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {(isAdmin || isLawyer || isSecretary) && (
        <>
          <h2 className="text-xl font-semibold mb-3 mt-8 text-foreground">Acciones y Navegación</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <NavCard
                href="/cases/new"
                icon={FolderPlus}
                title="Registrar Nuevo Caso"
                description="Crear una nueva ficha de caso legal."
                allowedRoles={[UserRole.ADMIN, UserRole.LAWYER, UserRole.SECRETARY]}
            />
            <NavCard
                href="/users"
                icon={UsersIcon}
                title="Gestionar Usuarios"
                description="Administrar cuentas de abogados, secretarias y administradores."
                allowedRoles={[UserRole.ADMIN]}
            />
             <NavCard
                href="/settings"
                icon={Settings}
                title="Configuración"
                description="Personalizar preferencias de la aplicación y consorcio."
                allowedRoles={[UserRole.ADMIN]} 
            />
            {isAdmin && (
                 <NavCard
                    href="/my-organization"
                    icon={Building}
                    title="Mi Organización"
                    description="Ver detalles de su plan y organización."
                    allowedRoles={[UserRole.ADMIN]}
                />
            )}
          </div>
        </>
      )}
      
      {(isAdmin || isSecretary) && stats.chartData && stats.chartData.length > 0 && (
        <Card className="shadow-md mb-6 mt-8">
          <CardHeader>
            <CardTitle>Casos por Materia (Organización)</CardTitle>
            <CardDescription>Distribución de los casos de su organización según su materia.</CardDescription>
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

      <div className="mb-6 p-4 border rounded-lg bg-card shadow mt-8" id="case-list-section">
        <h3 className="text-lg font-semibold mb-4">Filtrar y Ordenar Casos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
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
          <div className="grid grid-cols-2 gap-2">
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
      
      <h2 className="text-xl font-semibold mb-4 mt-8 text-foreground">
        {isAdmin ? "Listado de Casos (Organización)" : (isSecretary ? "Listado de Casos (Organización)" : "Mis Casos Asignados")}
      </h2>
      <CaseList cases={filteredCases} />
    </div>
  );
}
