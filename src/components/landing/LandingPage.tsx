
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, BarChart3, BellRing, ShieldCheck, Users, MessageSquareHeart, UserPlus } from "lucide-react";
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
          El Marketplace Legal que <span className="text-primary">Conecta</span> Clientes y Abogados
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mb-10">
          ¿Necesita ayuda legal? Describa su caso y nuestra IA le encontrará el abogado ideal. ¿Es un profesional del derecho? Únase a nuestra red para acceder a nuevos clientes y gestionar sus casos eficientemente.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8 py-6 text-lg"
            onClick={() => router.push('/register-client')}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Soy un Cliente y Busco Abogado
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary/10"
            onClick={() => router.push('/subscribe')}
          >
             <ShieldCheck className="mr-2 h-5 w-5" />
            Soy Abogado o Bufete
          </Button>
        </div>

        <div className="w-full max-w-5xl mb-16">
          <h3 className="text-2xl font-semibold text-foreground mb-8">¿Por qué elegir YASI K'ARI?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={BarChart3} 
              title="Matching Inteligente"
              description="Nuestra IA analiza su problema para conectarlo con el abogado más adecuado según especialidad y ubicación."
            />
            <FeatureCard 
              icon={Users}
              title="Perfiles Verificados"
              description="Acceda a una red de profesionales del derecho con perfiles detallados, especialidades y rangos de tarifas."
            />
             <FeatureCard 
              icon={CheckCircle}
              title="Gestión de Casos Potente"
              description="Los abogados suscritos obtienen herramientas de primer nivel para gestionar sus casos, recordatorios y documentos."
            />
            <FeatureCard 
              icon={MessageSquareHeart}
              title="Comunicación Directa"
              description="Una vez asignado, gestione la comunicación y el progreso de su caso directamente en la plataforma."
            />
            <FeatureCard 
              icon={BellRing}
              title="Recordatorios y Alertas"
              description="Tanto clientes como abogados se mantienen informados sobre las próximas actividades y plazos importantes."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Seguro y Confiable"
              description="Su información está protegida. Los datos de los clientes solo se comparten con el profesional elegido."
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
