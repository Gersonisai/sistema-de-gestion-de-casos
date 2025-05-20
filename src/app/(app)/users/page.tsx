"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
  const { isAdmin, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAdmin) {
        router.replace("/dashboard"); 
      } else {
        setIsClientLoading(false);
      }
    }
  }, [isAdmin, authIsLoading, router]);

  if (authIsLoading || isClientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Gestión de Usuarios" />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            Lista de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">La funcionalidad de gestión de usuarios estará disponible próximamente.</p>
            <p>Aquí los administradores podrán crear, editar y gestionar cuentas de abogados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
