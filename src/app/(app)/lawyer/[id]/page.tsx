"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import type { User as AppUser } from "@/lib/types";
import { Loader2, AlertTriangle, MapPin, Briefcase, BadgeDollarSign, Star, MessageSquarePlus, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import Image from 'next/image';
import { Separator } from "@/components/ui/separator";
import { useDocument } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";

function LawyerProfilePageContent() {
  const params = useParams();
  const lawyerId = params.id as string;
  
  const userDocRef = useMemo(() => lawyerId ? doc(db, "users", lawyerId) : null, [lawyerId]);
  const { data: lawyer, isLoading, error } = useDocument<AppUser>(userDocRef);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !lawyer || lawyer.role !== 'lawyer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold">Abogado No Encontrado</h2>
        <p className="text-muted-foreground mt-2">
          El perfil de abogado que está buscando no existe o ha sido eliminado.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Volver al Panel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <PageHeader title="Perfil del Abogado" />
      <Card className="shadow-xl overflow-hidden">
        <div className="bg-muted/50 p-8 flex flex-col md:flex-row items-center gap-8">
            <Image
                src={lawyer.profilePictureUrl || 'https://placehold.co/150x150?text=N/A'}
                alt={`Foto de ${lawyer.name}`}
                width={150}
                height={150}
                className="rounded-full object-cover border-4 border-background shadow-lg"
            />
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-primary">{lawyer.name}</h1>
                <div className="flex items-center justify-center md:justify-start text-muted-foreground gap-2 mt-2">
                    <MapPin className="h-5 w-5" />
                    <span>{lawyer.location}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500 mt-2">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-muted stroke-yellow-500" />
                    <span className="text-muted-foreground ml-2 text-sm">(4.8 de 23 reseñas)</span>
                </div>
            </div>
             <Button size="lg" className="md:ml-auto mt-4 md:mt-0" asChild>
                <Link href={`/chat?conversationWith=${lawyer.id}`}>
                    <MessageSquarePlus className="mr-2" /> Contactar Ahora
                </Link>
            </Button>
        </div>
        <CardContent className="p-6 md:p-8 space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                    {lawyer.specialties?.map(spec => (
                    <Badge key={spec} variant="secondary" className="text-base px-3 py-1">{spec}</Badge>
                    ))}
                </div>
            </div>
            
            <Separator/>

            <div>
                <h3 className="text-lg font-semibold mb-2">Biografía Profesional</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{lawyer.bio || "Biografía no disponible."}</p>
            </div>

            <Separator/>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BadgeDollarSign className="h-5 w-5 text-primary"/> Tarifas</h3>
                    <p className="text-muted-foreground">
                        {lawyer.hourlyRateRange 
                            ? `Este profesional maneja un rango de tarifas entre $${lawyer.hourlyRateRange[0]} y $${lawyer.hourlyRateRange[1]} por hora, dependiendo de la complejidad del caso.`
                            : "Contactar para información de tarifas."
                        }
                    </p>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/> Disponibilidad</h3>
                    <p className="text-muted-foreground">
                        Contacte para agendar una consulta inicial.
                    </p>
                    <Button variant="outline" className="mt-2">Ver Calendario</Button>
                </div>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function LawyerProfilePage() {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }>
        <LawyerProfilePageContent />
      </Suspense>
    );
  }
