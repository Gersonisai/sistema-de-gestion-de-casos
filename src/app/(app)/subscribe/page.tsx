
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlanFeatureProps {
  text: string;
}

const PlanFeature = ({ text }: PlanFeatureProps) => (
  <li className="flex items-center">
    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
    <span>{text}</span>
  </li>
);

export default function SubscribePage() {
  const { toast } = useToast();

  const handleChoosePlan = (planName: string) => {
    // En una aplicación real, esto redirigiría a Stripe/MercadoPago o iniciaría un proceso de pago.
    toast({
      title: `Plan ${planName} Seleccionado (Simulación)`,
      description: "La integración con pasarelas de pago es una funcionalidad futura.",
      duration: 5000,
    });
  };

  const plans = [
    {
      name: "Básico",
      price: "$19",
      priceSuffix: "/mes",
      icon: <Star className="h-8 w-8 text-primary mb-4" />,
      features: [
        "Hasta 10 usuarios",
        "Hasta 100 casos/mes",
        "Soporte técnico básico por email",
        "Funcionalidades esenciales de gestión",
      ],
      actionText: "Comenzar con Básico",
    },
    {
      name: "Premium",
      price: "$49",
      priceSuffix: "/mes",
      icon: <Building className="h-8 w-8 text-primary mb-4" />,
      features: [
        "Hasta 50 usuarios",
        "Casos ilimitados",
        "Soporte técnico prioritario (chat y email)",
        "Todas las funcionalidades Básico",
        "Reportes avanzados",
        "Opción de personalización de marca (logo y colores)",
      ],
      actionText: "Elegir Premium",
      popular: true,
    },
    {
      name: "Empresarial",
      price: "Contáctanos",
      priceSuffix: "",
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary mb-4"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path></svg>,
      features: [
        "Usuarios y almacenamiento personalizados",
        "Integraciones a medida (Microsoft 365, Google Drive, Slack)",
        "Soporte dedicado y SLA",
        "Dominio personalizado",
        "API para desarrolladores del consorcio",
      ],
      actionText: "Solicitar Demo",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Planes de Suscripción YASI K'ARI" />
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">Encuentra el plan perfecto para tu consorcio</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Comienza con una prueba gratuita de 14 días en nuestros planes Básico o Premium.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col shadow-xl ${plan.popular ? 'border-2 border-primary ring-2 ring-primary/50' : 'border'}`}>
            {plan.popular && (
              <div className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold text-center rounded-t-md -mb-px">
                Más Popular
              </div>
            )}
            <CardHeader className="items-center text-center">
              {plan.icon}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-4xl font-bold text-foreground">
                {plan.price}
                {plan.priceSuffix && <span className="text-sm font-normal text-muted-foreground">{plan.priceSuffix}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <PlanFeature key={index} text={feature} />
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleChoosePlan(plan.name)}
              >
                {plan.actionText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-12 text-center text-muted-foreground">
        <p>¿Necesitas algo diferente? <a href="mailto:ventas@yasikari.com" className="text-primary hover:underline">Contacta con nuestro equipo de ventas</a> para soluciones personalizadas.</p>
        <p className="text-xs mt-2">*Todos los precios son ilustrativos y están sujetos a cambios.</p>
      </div>
    </div>
  );
}
