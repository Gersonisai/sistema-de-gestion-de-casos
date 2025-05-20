
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
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "granted") {
        // Verificar si ya existe una suscripción
        navigator.serviceWorker.ready.then(registration => {
          registration.pushManager.getSubscription().then(subscription => {
            if (subscription) {
              setNotificationsEnabled(true);
            } else {
              setNotificationsEnabled(false);
            }
            setIsCheckingPermission(false);
          });
        });
      } else {
        setNotificationsEnabled(false);
        setIsCheckingPermission(false);
      }
    } else {
      // Notifications API no soportada
      setNotificationPermission("denied"); // Tratar como denegado si no es soportado
      setNotificationsEnabled(false);
      setIsCheckingPermission(false);
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: "Preferencia Guardada",
      description: `Tema cambiado a: ${newTheme}. La aplicación del tema real requiere implementación adicional.`,
    });
    // TODO: Implement theme changing logic (e.g., class on HTML, localStorage)
  };

  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({ variant: "destructive", title: "Navegador no compatible", description: "Push Notifications no soportadas." });
      return null;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        console.log('Ya existe una suscripción Push:', subscription);
        return subscription;
      }

      // TODO: Reemplaza 'YOUR_VAPID_PUBLIC_KEY' con tu clave pública VAPID real obtenida de Firebase u otro servicio.
      // Esta clave es necesaria para que el servidor de push identifique tu aplicación.
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY_PLACEHOLDER';
      if (vapidPublicKey === 'YOUR_VAPID_PUBLIC_KEY_PLACEHOLDER') {
        console.warn("Clave VAPID pública no configurada. Las suscripciones Push podrían fallar o no funcionar correctamente en producción.");
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
      console.log('Suscripción Push exitosa:', subscription);
      console.log('Este es el objeto de suscripción que debes enviar a tu backend:', JSON.stringify(subscription));
      // TODO: Enviar la suscripción (subscription.toJSON()) a tu servidor backend para almacenarla.
      // Ejemplo: await fetch('/api/subscribe-push', { method: 'POST', body: JSON.stringify(subscription), headers: {'Content-Type': 'application/json'} });
      return subscription;
    } catch (err) {
      console.error('Error al suscribir a Push Notifications:', err);
      toast({ variant: "destructive", title: "Error de Suscripción", description: "No se pudo suscribir a notificaciones." });
      return null;
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Suscripción Push eliminada.');
        // TODO: Notificar al backend para eliminar la suscripción de la base de datos.
        // Ejemplo: await fetch('/api/unsubscribe-push', { method: 'POST', body: JSON.stringify({ endpoint: subscription.endpoint }), headers: {'Content-Type': 'application/json'} });
        toast({ title: "Suscripción Cancelada", description: "Ya no recibirás notificaciones push." });
      }
    } catch (err) {
      console.error('Error al cancelar suscripción Push:', err);
      toast({ variant: "destructive", title: "Error", description: "No se pudo cancelar la suscripción a notificaciones." });
    }
  };


  const handleNotificationsToggle = async (enabled: boolean) => {
    setIsSubscribing(true);
    if (enabled) {
      if (notificationPermission === 'granted') {
        const sub = await subscribeToPushNotifications();
        if (sub) {
          setNotificationsEnabled(true);
          toast({ title: "Notificaciones Habilitadas", description: "Ya estás suscrito para recibir notificaciones." });
        } else {
          setNotificationsEnabled(false); // Falló la suscripción
        }
      } else if (notificationPermission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === "granted") {
          const sub = await subscribeToPushNotifications();
          if (sub) {
            setNotificationsEnabled(true);
            toast({ title: "¡Notificaciones Habilitadas!", description: "Ahora recibirás notificaciones de YASI K'ARI." });
          } else {
            setNotificationsEnabled(false);
          }
        } else {
          setNotificationsEnabled(false);
          toast({ variant: "destructive", title: "Permiso Denegado", description: "No has concedido permiso para las notificaciones." });
        }
      } else { // denied
        setNotificationsEnabled(false);
        toast({ variant: "destructive", title: "Permiso Bloqueado", description: "Has bloqueado las notificaciones. Debes habilitarlas en la configuración de tu navegador." });
      }
    } else {
      // Deshabilitar: cancelar suscripción
      await unsubscribeFromPushNotifications();
      setNotificationsEnabled(false);
    }
    setIsSubscribing(false);
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
              <h3 className="text-lg font-medium">Preferencias de Notificación Push</h3>
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
                  {notificationPermission === 'granted' && notificationsEnabled && 'Suscrito. Recibirás notificaciones.'}
                  {notificationPermission === 'granted' && !notificationsEnabled && 'Permiso concedido, pero no suscrito. Activa para suscribirte.'}
                  {notificationPermission === 'denied' && 'Permiso bloqueado por el navegador.'}
                  {notificationPermission === 'default' && 'Permite recibir alertas sobre actividad importante.'}
                </p>
              </div>
              <Switch
                id="notifications-switch"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
                disabled={notificationPermission === 'denied' || isCheckingPermission || isSubscribing}
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
            {typeof window !== 'undefined' && !('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) && (
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

