
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, BarChart3, BellRing, ShieldCheck, Users, MessageSquareHeart } from "lucide-react";
import { useRouter } from "next/navigation";

const FeatureCard = ({ icon, title, description }: { icon: React.ElementType, title: string, description: string }) => {
  const IconComponent = icon;
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <IconComponent className="h-8 w-8 text-primary" />
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col items-center justify-center p-4 lg:p-8">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">YASI K'ARI</h1>
        <Button variant="outline" onClick={() => router.push('/login')}>
          Iniciar Sesión
        </Button>
      </header>

      <main className="container mx-auto flex flex-col items-center text-center mt-20 lg:mt-24">
        <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-6">
          La Gestión Legal Inteligente que <span className="text-primary">Transforma</span> su Práctica
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mb-10">
          YASI K'ARI optimiza su flujo de trabajo con gestión de casos eficiente, recordatorios automáticos y notificaciones impulsadas por IA. Concéntrese en sus clientes, nosotros nos encargamos del resto.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8 py-6 text-lg"
            onClick={() => router.push('/verify-identity')}
          >
            Iniciar Prueba Gratuita (30 Días)
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary/10"
            onClick={() => router.push('/subscribe')}
          >
            Ver Planes de Suscripción
          </Button>
        </div>

        <div className="w-full max-w-5xl mb-16">
          <h3 className="text-2xl font-semibold text-foreground mb-8">¿Por qué elegir YASI K'ARI?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={BarChart3} 
              title="Visión Integral de Casos"
              description="Organice y acceda a todos los detalles de sus casos, desde NUREJ hasta la próxima actividad, todo en un solo lugar."
            />
            <FeatureCard 
              icon={BellRing}
              title="Recordatorios Inteligentes"
              description="Nunca más olvide una fecha límite. Programe recordatorios y reciba notificaciones proactivas para estar siempre al tanto."
            />
            <FeatureCard 
              icon={MessageSquareHeart}
              title="Notificaciones con IA"
              description="Nuestra IA genera notificaciones claras y concisas, ayudándole a priorizar y actuar eficientemente."
            />
            <FeatureCard 
              icon={Users}
              title="Colaboración Eficaz"
              description="Diseñado para administradores y abogados, facilitando la asignación de casos y la supervisión del progreso."
            />
             <FeatureCard 
              icon={ShieldCheck}
              title="Verificación Segura"
              description="Proceso de verificación para pruebas gratuitas, asegurando un entorno confiable para todos los usuarios."
            />
            <FeatureCard 
              icon={CheckCircle}
              title="Multiplataforma y PWA"
              description="Acceda desde la web o instale la aplicación en su dispositivo para una experiencia optimizada y sin distracciones."
            />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-10">
          YASI K'ARI es una solución en evolución. Estamos comprometidos con la mejora continua.
        </p>
      </main>

      <footer className="w-full text-center p-4 mt-auto text-muted-foreground text-xs">
        &copy; {new Date().getFullYear()} YASI K'ARI. Todos los derechos reservados.
      </footer>
    </div>
  );
}
