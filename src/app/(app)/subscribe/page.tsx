
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Building, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleChoosePaidPlan = (planName: string) => {
    // En una aplicación real, esto redirigiría a Stripe/MercadoPago.
    // Por ahora, simulamos que el pago fue exitoso y redirigimos al registro de la organización.
    toast({
      title: `Plan ${planName} Seleccionado (Simulación)`,
      description: "Procediendo al registro de su organización. La integración con pasarelas de pago es una funcionalidad futura.",
      duration: 5000,
    });
    router.push("/register-organization?plan=" + planName.toLowerCase());
  };

  const handleStartFreeTrial = () => {
    router.push("/verify-identity");
  };

  const plans = [
    {
      name: "Básico",
      price: "$19",
      priceSuffix: "/mes",
      icon: <Star className="h-8 w-8 text-primary mb-4" />,
      features: [
        "1 Administrador",
        "Hasta 5 abogados",
        "Hasta 100 casos/mes",
        "Soporte técnico básico por email",
        "Funcionalidades esenciales de gestión",
      ],
      actionText: "Elegir Plan Básico",
      ctaType: "paid",
      trialAvailable: true,
    },
    {
      name: "Premium",
      price: "$49",
      priceSuffix: "/mes",
      icon: <Building className="h-8 w-8 text-primary mb-4" />,
      features: [
        "Hasta 3 Administradores",
        "Hasta 20 abogados",
        "Casos ilimitados",
        "Soporte técnico prioritario (chat y email)",
        "Todas las funcionalidades Básico",
        "Reportes avanzados",
        "Opción de personalización de marca (logo y colores)",
      ],
      actionText: "Elegir Premium",
      popular: true,
      ctaType: "paid",
    },
    {
      name: "Empresarial",
      price: "Contáctanos",
      priceSuffix: "",
      icon: <HelpCircle className="h-8 w-8 text-primary mb-4" />, // Replaced SVG with Lucide icon
      features: [
        "Usuarios y almacenamiento personalizados",
        "Integraciones a medida (Microsoft 365, Google Drive, Slack)",
        "Soporte dedicado y SLA",
        "Dominio personalizado",
        "API para desarrolladores del consorcio",
      ],
      actionText: "Solicitar Demo",
      ctaType: "contact",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Planes de Suscripción YASI K'ARI" />
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">Encuentre el plan perfecto para su consorcio legal</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Elija un plan o comience con una prueba gratuita de 30 días del Plan Básico.
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
            <CardFooter className="flex-col items-stretch space-y-2">
              {plan.ctaType === "paid" && (
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleChoosePaidPlan(plan.name)}
                >
                  {plan.actionText}
                </Button>
              )}
              {plan.trialAvailable && (
                 <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleStartFreeTrial}
                >
                  Iniciar Prueba Gratuita (30 días)
                </Button>
              )}
              {plan.ctaType === "contact" && (
                 <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push('mailto:ventas@yasikari.com')}
                >
                  {plan.actionText}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-12 text-center text-muted-foreground">
        <p className="text-xs mt-2">*Todos los precios son ilustrativos y están sujetos a cambios.</p>
      </div>
    </div>
  );
}
