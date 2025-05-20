"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Configuración" />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="mr-2 h-6 w-6 text-primary" />
            Ajustes de la Aplicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">La sección de configuración estará disponible próximamente.</p>
            <p>Aquí podrá personalizar las preferencias de la aplicación, gestionar notificaciones y más.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
