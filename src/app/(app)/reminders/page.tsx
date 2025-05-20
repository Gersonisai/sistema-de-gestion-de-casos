"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

export default function RemindersPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Mis Recordatorios" />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarCheck className="mr-2 h-6 w-6 text-primary" />
            Próximos Recordatorios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">La funcionalidad de gestión de recordatorios centralizada estará disponible próximamente.</p>
            <p>Por ahora, puede gestionar recordatorios directamente desde la vista de cada caso.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
