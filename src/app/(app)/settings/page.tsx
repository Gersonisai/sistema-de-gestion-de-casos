
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Palette, Bell, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button"; // Import Button

export default function SettingsPage() {
  const { toast } = useToast();
  const [theme, setTheme] = useState("system");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === "granted");
    } else {
      // Notifications API not supported
      setNotificationPermission("denied"); // Treat as denied if not supported
    }
    setIsCheckingPermission(false);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: "Preferencia Guardada",
      description: `Tema cambiado a: ${newTheme}. La aplicación del tema real requiere implementación adicional.`,
    });
    // TODO: Implement theme changing logic (e.g., class on HTML, localStorage)
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        variant: "destructive",
        title: "Navegador no compatible",
        description: "Este navegador no soporta notificaciones push.",
      });
      setNotificationsEnabled(false);
      return;
    }

    if (notificationPermission === 'granted') {
      setNotificationsEnabled(true);
      toast({
        title: "Notificaciones ya habilitadas",
        description: "Ya has concedido permiso para las notificaciones.",
      });
      return;
    }

    if (notificationPermission === 'denied') {
      toast({
        variant: "destructive",
        title: "Permiso Bloqueado",
        description: "Has bloqueado las notificaciones. Debes habilitarlas en la configuración de tu navegador.",
      });
      setNotificationsEnabled(false);
      return;
    }

    // 'default' state, request permission
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({
          title: "¡Notificaciones Habilitadas!",
          description: "Ahora recibirás notificaciones de YASI K'ARI.",
        });
        // Aquí es donde, en una app completa, enviarías el token de suscripción a tu backend
        // navigator.serviceWorker.ready.then(registration => {
        //   registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' })
        //     .then(subscription => {
        //       console.log('Suscripción Push exitosa:', subscription);
        //       // TODO: Enviar la suscripción (subscription object) a tu servidor backend
        //     })
        //     .catch(err => console.error('Error al suscribir a Push:', err));
        // });
      } else {
        setNotificationsEnabled(false);
        toast({
          variant: "destructive",
          title: "Permiso Denegado",
          description: "No has concedido permiso para las notificaciones.",
        });
      }
    } catch (error) {
      console.error("Error solicitando permiso de notificación:", error);
      setNotificationsEnabled(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al solicitar permiso para notificaciones.",
      });
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      await requestNotificationPermission();
    } else {
      // Si el usuario desactiva el switch, simplemente actualizamos el estado
      // No podemos "revocar" el permiso 'granted' desde JS.
      // El usuario tendría que hacerlo desde la configuración del navegador.
      setNotificationsEnabled(false);
      toast({
        title: "Notificaciones Deshabilitadas",
        description: "Ya no se intentará mostrar notificaciones (si el permiso estaba concedido, sigue estándolo a nivel de navegador).",
      });
    }
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

          <div className="space-y-4">
            <div className="flex items-center">
              <Bell className="mr-3 h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Preferencias de Notificación</h3>
            </div>
            {isCheckingPermission ? (
                 <p className="text-sm text-muted-foreground">Comprobando permisos de notificación...</p>
            ) : (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="notifications-switch" className="font-medium">
                  Habilitar Notificaciones Push
                </Label>
                <p className="text-xs text-muted-foreground">
                  {notificationPermission === 'granted' && 'Permiso concedido. Recibirás notificaciones.'}
                  {notificationPermission === 'denied' && 'Permiso bloqueado por el navegador.'}
                  {notificationPermission === 'default' && 'Permite recibir alertas sobre actividad importante.'}
                </p>
              </div>
              <Switch
                id="notifications-switch"
                checked={notificationsEnabled && notificationPermission === 'granted'}
                onCheckedChange={handleNotificationsToggle}
                disabled={notificationPermission === 'denied' || isCheckingPermission}
                aria-label="Habilitar notificaciones push"
              />
            </div>
            )}
             {notificationPermission === 'denied' && (
              <div className="flex items-start p-3 rounded-md border border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-yellow-600 dark:text-yellow-500" />
                <p className="text-xs">
                  Has bloqueado las notificaciones para YASI K'ARI en tu navegador. Para habilitarlas, necesitas cambiar los permisos en la configuración de sitios de tu navegador.
                </p>
              </div>
            )}
            {typeof window !== 'undefined' && !('Notification' in window) && (
                 <div className="flex items-start p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
                    <p className="text-xs">
                    Este navegador no es compatible con las Notificaciones Push. Considera usar un navegador moderno como Chrome, Firefox, Edge o Safari (en macOS/iOS) para esta funcionalidad.
                    </p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
