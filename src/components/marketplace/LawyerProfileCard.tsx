
"use client";

import type { User as AppUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { MapPin, Briefcase, BadgeDollarSign, MessageSquarePlus, Star } from 'lucide-react';
import Link from 'next/link';

interface LawyerProfileCardProps {
  lawyer: AppUser;
}

export function LawyerProfileCard({ lawyer }: LawyerProfileCardProps) {
  const handleContact = () => {
    // En una app real, esto podría abrir un chat o un formulario de contacto.
    alert(`Simulación: Contactando a ${lawyer.name}...`);
  };

  return (
    <Card className="flex flex-col sm:flex-row items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0">
        <Image
          src={lawyer.profilePictureUrl || 'https://placehold.co/100x100?text=N/A'}
          alt={`Foto de ${lawyer.name}`}
          width={100}
          height={100}
          className="rounded-full object-cover border-2 border-primary"
        />
      </div>
      <div className="flex-grow">
        <CardHeader className="p-0 mb-2">
          <div className="flex justify-between items-center">
            <Link href={`/lawyer/${lawyer.id}`}>
                <CardTitle className="text-lg font-bold hover:underline hover:text-primary">{lawyer.name}</CardTitle>
            </Link>
            {/* Simulación de rating */}
            <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                <span className="font-semibold">4.8</span>
                <span className="text-muted-foreground text-xs">(23)</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <MapPin className="h-4 w-4" />
            <span>{lawyer.location}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            {lawyer.specialties?.map(spec => (
              <Badge key={spec} variant="secondary">{spec}</Badge>
            ))}
          </div>
          <p className="text-muted-foreground line-clamp-2">{lawyer.bio}</p>
           {lawyer.hourlyRateRange && (
            <div className="flex items-center gap-2 text-primary font-medium">
                <BadgeDollarSign className="h-4 w-4"/>
                <span>Tarifa: ${lawyer.hourlyRateRange[0]} - ${lawyer.hourlyRateRange[1]} / hora</span>
            </div>
           )}
        </CardContent>
        <CardFooter className="p-0 pt-3 flex justify-end">
          <Button onClick={handleContact} size="sm">
            <MessageSquarePlus className="mr-2 h-4 w-4" /> Contactar
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
