
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Palette, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  // TODO: These states should be loaded from and saved to user preferences (e.g., localStorage or backend)
  const [theme, setTheme] = useState("system");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // In a real app, you would apply the theme here (e.g., by changing a class on the HTML element)
    // and save the preference.
    toast({
      title: "Preferencia Guardada",
      description: `Tema cambiado a: ${newTheme}. La aplicación del tema real requiere implementación adicional.`,
    });
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    // In a real app, you would save this preference.
    toast({
      title: "Preferencia Guardada",
      description: `Notificaciones ${enabled ? "habilitadas" : "deshabilitadas"}.`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Configuración" />
      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <SettingsIcon className="mr-3 h-6 w-6 text-primary" />
            Ajustes de la Aplicación
          </CardTitle>
          <CardDescription>
            Personalice las preferencias de la aplicación y gestione sus notificaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Appearance Settings */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Palette className="mr-3 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Preferencias de Apariencia</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 items-center">
              <Label htmlFor="theme-select" className="sm:col-span-1">Tema de la Aplicación</Label>
              <div className="sm:col-span-2">
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme-select" className="w-full">
                    <SelectValue placeholder="Seleccionar tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground mt-1">
                    Seleccione su tema visual preferido. El cambio de tema real requiere configuración adicional.
                  </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Bell className="mr-3 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Preferencias de Notificación</h3>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="notifications-switch" className="font-medium">
                  Habilitar Notificaciones Push
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reciba alertas sobre actividad importante en sus casos.
                </p>
              </div>
              <Switch
                id="notifications-switch"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
                aria-label="Habilitar notificaciones push"
              />
            </div>
          </div>
          
          {/* Placeholder for future settings sections */}
          {/* <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Más Configuraciones</h3>
            <p className="text-sm text-muted-foreground">
              Otras opciones de configuración estarán disponibles aquí en el futuro.
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
