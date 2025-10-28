
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { mockOrganizations, mockUsers } from "@/data/mockData";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Building, Users, HardDrive, AlertTriangle, BadgeCent, ArrowRight } from "lucide-react";
import type { Organization } from "@/lib/types";
import { UserRole, PLAN_LIMITS } from "@/lib/types";
import { THEME_PALETTES } from "@/lib/types";


function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export default function MyOrganizationPage() {
  const { currentUser, isAdmin, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null | undefined>(undefined);
  const [teamMemberCount, setTeamMemberCount] = useState(0);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin) {
        router.replace("/dashboard");
        return;
      }
      if (currentUser?.organizationId) {
        const orgData = mockOrganizations.find(o => o.id === currentUser.organizationId);
        setOrganization(orgData || null);

        const members = mockUsers.filter(
          u => u.organizationId === currentUser.organizationId && (u.role === UserRole.LAWYER || u.role === UserRole.SECRETARY)
        ).length;
        setTeamMemberCount(members);
      } else {
        setOrganization(null);
      }
    }
  }, [currentUser, isAdmin, authIsLoading, router]);

  const planDetails = useMemo(() => {
    if (!organization) return null;
    return PLAN_LIMITS[organization.plan];
  }, [organization]);

  const storageUsagePercentage = useMemo(() => {
    if (!organization || !planDetails || !organization.currentStorageUsedBytes) return 0;
    if (planDetails.maxStorageGB === Infinity) return 0; // No limit
    const maxBytes = planDetails.maxStorageGB * 1024 * 1024 * 1024;
    return (organization.currentStorageUsedBytes / maxBytes) * 100;
  }, [organization, planDetails]);
  
  const teamUsagePercentage = useMemo(() => {
    if (!planDetails) return 0;
    if (planDetails.maxTeamMembers === Infinity) return 0;
    return (teamMemberCount / planDetails.maxTeamMembers) * 100;
  }, [teamMemberCount, planDetails]);


  if (authIsLoading || organization === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (organization === null) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-destructive rounded-lg bg-destructive/10">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold">Error: Organización no encontrada</h2>
          <p className="text-muted-foreground mt-2">
            Su cuenta de administrador no parece estar asociada a ninguna organización.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Volver al Panel</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const paletteName = THEME_PALETTES.find(p => p.id === organization.themePalette)?.name || "YASI K'ARI Corporativo";

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Mi Organización" />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
             <Building className="h-10 w-10 text-primary" />
             <div>
                <CardTitle className="text-2xl">{organization.name}</CardTitle>
                <CardDescription>Plan Actual: <span className="font-semibold text-primary capitalize">{organization.plan.replace('_', ' ')}</span></CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team Members Usage */}
            <Card className="bg-muted/50">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2"><Users /> Miembros del Equipo</CardTitle>
                <Badge variant="secondary">{teamMemberCount} / {planDetails?.maxTeamMembers === Infinity ? 'Ilimitados' : planDetails?.maxTeamMembers}</Badge>
              </CardHeader>
              <CardContent>
                <Progress value={teamUsagePercentage} aria-label={`${teamUsagePercentage.toFixed(0)}% de miembros del equipo usados`} />
                <p className="text-xs text-muted-foreground mt-2">
                  Ha utilizado {teamMemberCount} de los {planDetails?.maxTeamMembers === Infinity ? 'ilimitados' : planDetails?.maxTeamMembers} asientos disponibles para abogados y secretarias.
                </p>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/users">
                        Gestionar Usuarios <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                 </Button>
              </CardFooter>
            </Card>

            {/* Storage Usage */}
             <Card className="bg-muted/50">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2"><HardDrive /> Almacenamiento</CardTitle>
                <Badge variant="secondary">{formatBytes(organization.currentStorageUsedBytes || 0)} / {planDetails?.maxStorageGB === Infinity ? 'Ilimitado' : `${planDetails?.maxStorageGB} GB`}</Badge>
              </CardHeader>
              <CardContent>
                <Progress value={storageUsagePercentage} aria-label={`${storageUsagePercentage.toFixed(0)}% de almacenamiento usado`} />
                 <p className="text-xs text-muted-foreground mt-2">
                  Almacenamiento en la nube utilizado para los archivos adjuntos de sus casos (simulación).
                </p>
              </CardContent>
               <CardFooter>
                 <p className="text-xs text-muted-foreground">La subida de archivos está deshabilitada si se alcanza el límite.</p>
              </CardFooter>
            </Card>
          </div>
          
           <div>
              <h3 className="text-lg font-semibold mb-2">Detalles Adicionales</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Propietario de la cuenta:</strong> {currentUser?.name} ({currentUser?.email})</p>
                <p><strong>Fecha de creación:</strong> {new Date(organization.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Paleta de colores activa:</strong> {paletteName}</p>
              </div>
           </div>

        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">¿Necesita más capacidad?</p>
            <Button asChild>
                <Link href="/subscribe">
                    <BadgeCent className="mr-2 h-4 w-4"/> Ver o Cambiar de Plan
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    