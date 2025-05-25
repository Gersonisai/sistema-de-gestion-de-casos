
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Palette, Bell, AlertTriangle, Building, PaletteIcon, KeyRound, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth"; // For checking admin role

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


export default function SettingsPage() {
  const { toast } = useToast();
  const { isAdmin } = useAuth(); // Check if user is admin

  // App Settings
  const [theme, setTheme] = useState("system");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Consortium Settings (simulated)
  const [consortiumName, setConsortiumName] = useState("Mi Bufete YASI K'ARI");
  const [consortiumLogo, setConsortiumLogo] = useState<File | null>(null);
  const [consortiumColor, setConsortiumColor] = useState("#3F51B5");

  // VAPID Key Check
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const isVapidKeyConfigured = vapidPublicKey && vapidPublicKey !== 'YOUR_VAPID_PUBLIC_KEY_PLACEHOLDER';


  useEffect(() => {
    if (!isVapidKeyConfigured) {
      console.warn("Clave VAPID pública no configurada. Las suscripciones Push podrían fallar. Obtenga una de Firebase (Cloud Messaging) y configúrela como NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
    }

    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "granted" && isVapidKeyConfigured) {
        navigator.serviceWorker.ready.then(registration => {
          registration.pushManager.getSubscription().then(subscription => {
            if (subscription) {
              setNotificationsEnabled(true);
              console.log('Suscripción Push existente encontrada:', JSON.stringify(subscription));
            } else {
              setNotificationsEnabled(false);
            }
            setIsCheckingPermission(false);
          });
        }).catch(err => {
            console.error("Error al verificar Service Worker o suscripción:", err);
            setIsCheckingPermission(false);
        });
      } else {
        setNotificationsEnabled(false);
        setIsCheckingPermission(false);
      }
    } else {
      setNotificationPermission("denied"); 
      setNotificationsEnabled(false);
      setIsCheckingPermission(false);
    }
  }, [isVapidKeyConfigured]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Lógica para aplicar el tema (ej. añadir/quitar clase 'dark' al body) no implementada aún
    toast({
      title: "Preferencia Guardada",
      description: `Tema cambiado a: ${newTheme}. La aplicación del tema real requiere implementación adicional.`,
    });
  };

  const subscribeToPushNotifications = async () => {
    if (!isVapidKeyConfigured) {
        toast({ variant: "destructive", title: "Configuración Requerida", description: "La clave VAPID pública no está configurada. No se puede suscribir." });
        return null;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({ variant: "destructive", title: "Navegador no compatible", description: "Push Notifications no soportadas." });
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        console.log('Ya existe una suscripción Push:', JSON.stringify(subscription));
        // TODO: Enviar la suscripción (subscription.toJSON()) a tu servidor backend para almacenarla.
        return subscription;
      }
      
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey!);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log('Suscripción Push exitosa:', JSON.stringify(subscription));
      // TODO: Enviar la suscripción (subscription.toJSON()) a tu servidor backend para almacenarla.
      return subscription;
    } catch (err) {
      console.error('Error al suscribir a Push Notifications:', err);
      if (err instanceof DOMException && (err.name === 'InvalidStateError' || err.name === 'NotSupportedError' || err.name === 'InvalidAccessError')) {
         toast({ variant: "destructive", title: "Error de Suscripción", description: "No se pudo suscribir. Verifica la clave VAPID o la configuración del service worker. Asegúrate que la app se sirve sobre HTTPS para producción." });
      } else {
        toast({ variant: "destructive", title: "Error de Suscripción", description: "No se pudo suscribir a notificaciones." });
      }
      return null;
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const unsubscribed = await subscription.unsubscribe();
        if (unsubscribed) {
            console.log('Suscripción Push eliminada.');
            // TODO: Notificar al backend para eliminar la suscripción de la base de datos.
            toast({ title: "Suscripción Cancelada", description: "Ya no recibirás notificaciones push." });
        } else {
            toast({ variant: "destructive", title: "Error", description: "No se pudo cancelar la suscripción." });
        }
      }
    } catch (err) {
      console.error('Error al cancelar suscripción Push:', err);
      toast({ variant: "destructive", title: "Error", description: "No se pudo cancelar la suscripción." });
    }
  };


  const handleNotificationsToggle = async (enabled: boolean) => {
    setIsSubscribing(true);
    if (enabled) {
      if (notificationPermission === 'granted') {
        const sub = await subscribeToPushNotifications();
        if (sub) {
          setNotificationsEnabled(true);
          toast({ title: "Notificaciones Habilitadas", description: "Suscrito para recibir notificaciones." });
        } else {
          setNotificationsEnabled(false); 
        }
      } else if (notificationPermission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === "granted") {
          const sub = await subscribeToPushNotifications();
          if (sub) {
            setNotificationsEnabled(true);
            toast({ title: "¡Notificaciones Habilitadas!", description: "Ahora recibirás notificaciones." });
          } else {
            setNotificationsEnabled(false);
          }
        } else {
          setNotificationsEnabled(false);
          toast({ variant: "destructive", title: "Permiso Denegado", description: "No concediste permiso para notificaciones." });
        }
      } else { 
        setNotificationsEnabled(false);
        toast({ variant: "destructive", title: "Permiso Bloqueado", description: "Has bloqueado las notificaciones. Habilítalas en la config. de tu navegador." });
      }
    } else {
      await unsubscribeFromPushNotifications();
      setNotificationsEnabled(false);
    }
    setIsSubscribing(false);
  };

  const handleConsortiumSettingsSave = () => {
    // En una app real, esto enviaría los datos al backend para guardarlos.
    toast({
      title: "Configuración de Consorcio Guardada (Simulación)",
      description: `Nombre: ${consortiumName}, Color: ${consortiumColor}, Logo: ${consortiumLogo?.name || 'Ninguno'}`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Configuración" />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna de Ajustes Generales */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <SettingsIcon className="mr-3 h-6 w-6 text-primary" />
                Ajustes Generales de la Aplicación
              </CardTitle>
              <CardDescription>
                Personalice las preferencias globales de la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Preferencias de Apariencia */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Palette className="mr-3 h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Apariencia</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 items-center">
                  <Label htmlFor="theme-select" className="sm:col-span-1">Tema</Label>
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
                        Seleccione su tema visual. La aplicación real del tema requiere implementación adicional.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Preferencias de Notificación Push */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Bell className="mr-3 h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Notificaciones Push</h3>
                </div>
                {!isVapidKeyConfigured && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Configuración Requerida para Notificaciones</AlertTitle>
                      <AlertDescription>
                        La clave VAPID pública no está configurada en las variables de entorno (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`).
                        Las notificaciones Push no pueden habilitarse. Obtenga una de Firebase (Cloud Messaging {'>'} Configuración Web {'>'} Par de claves).
                      </AlertDescription>
                    </Alert>
                )}
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
                    disabled={notificationPermission === 'denied' || isCheckingPermission || isSubscribing || !isVapidKeyConfigured}
                    aria-label="Habilitar notificaciones push"
                  />
                </div>
                )}
                {notificationPermission === 'denied' && (
                  <div className="flex items-start p-3 rounded-md border border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-yellow-600 dark:text-yellow-500" />
                    <p className="text-xs">
                      Has bloqueado las notificaciones para YASI K'ARI. Para habilitarlas, necesitas cambiar los permisos en la configuración de sitios de tu navegador.
                    </p>
                  </div>
                )}
                {typeof window !== 'undefined' && !('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) && (
                    <div className="flex items-start p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
                        <p className="text-xs">
                        Este navegador no es compatible con Notificaciones Push. Considera usar Chrome, Firefox, Edge o Safari (macOS/iOS).
                        </p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna de Ajustes de Consorcio (Solo Admin) */}
        {isAdmin && (
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Building className="mr-3 h-6 w-6 text-primary" />
                  Configuración del Consorcio
                </CardTitle>
                <CardDescription>
                  Personalice la identidad y ajustes específicos de su consorcio. (Simulación)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Marca del Consorcio */}
                <div className="space-y-4">
                  <div className="flex items-center">
                     <PaletteIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                     <h3 className="text-lg font-medium">Marca e Identidad</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consortiumName">Nombre del Consorcio</Label>
                    <Input id="consortiumName" value={consortiumName} onChange={(e) => setConsortiumName(e.target.value)} placeholder="Ej: Bufete Legal XYZ" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consortiumLogo">Logo del Consorcio</Label>
                    <Input id="consortiumLogo" type="file" onChange={(e) => setConsortiumLogo(e.target.files ? e.target.files[0] : null)} />
                    {consortiumLogo && <p className="text-xs text-muted-foreground">Archivo seleccionado: {consortiumLogo.name}</p>}
                    <p className="text-xs text-muted-foreground">La subida y aplicación real del logo es una funcionalidad futura.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consortiumColor">Color Primario del Consorcio</Label>
                    <Input id="consortiumColor" type="text" value={consortiumColor} onChange={(e) => setConsortiumColor(e.target.value)} placeholder="#RRGGBB" />
                     <p className="text-xs text-muted-foreground">Ingrese un color hexadecimal. La aplicación real del color es una funcionalidad futura.</p>
                  </div>
                </div>
                
                <Separator />

                {/* Roles Avanzados */}
                 <div className="space-y-2">
                    <div className="flex items-center">
                        <KeyRound className="mr-3 h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Roles Avanzados</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        La creación de permisos granulares (ej: "Socio", "Asistente", "Invitado") y la restricción de acceso a datos sensibles por rol son funcionalidades futuras que requieren desarrollo de backend.
                    </p>
                </div>

                <Separator />

                {/* Integraciones */}
                <div className="space-y-2">
                    <div className="flex items-center">
                        <LinkIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Integraciones</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        La conexión con herramientas externas (Microsoft 365, Google Drive, Slack) y una API abierta para desarrolladores del consorcio son funcionalidades futuras.
                    </p>
                </div>

                <Button onClick={handleConsortiumSettingsSave} className="w-full">
                  Guardar Config. Consorcio (Simulación)
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
