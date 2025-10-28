
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { Separator } from "@/components/ui/separator";
import { Search, Bot, ArrowRight, Loader2, Sparkles, User, MapPin, BadgeDollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { User as AppUser, CaseSubject } from '@/lib/types';
import { CASE_SUBJECTS_OPTIONS } from '@/lib/types';
import { mockUsers } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { matchLawyer, MatchLawyerOutput } from '@/ai/flows/match-lawyer-flow';
import { LawyerProfileCard } from './LawyerProfileCard';

export function ClientDashboard() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // State for AI Matching
  const [problemDescription, setProblemDescription] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [suggestedLawyers, setSuggestedLawyers] = useState<MatchLawyerOutput | null>(null);

  // State for Manual Search
  const [searchSpecialty, setSearchSpecialty] = useState<CaseSubject | 'ALL'>('ALL');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchBudget, setSearchBudget] = useState<string>('ALL');
  const [manualSearchResults, setManualSearchResults] = useState<AppUser[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleAiMatch = async () => {
    if (!problemDescription.trim()) {
      toast({ variant: 'destructive', title: 'Descripción vacía', description: 'Por favor, describa su problema legal.' });
      return;
    }
    setIsMatching(true);
    setSuggestedLawyers(null);
    try {
      // In a real app, you might also send currentUser.location
      const results = await matchLawyer({ problemDescription });
      setSuggestedLawyers(results);
    } catch (error) {
      console.error("Error matching lawyer with AI:", error);
      toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo procesar su solicitud. Intente de nuevo.' });
    } finally {
      setIsMatching(false);
    }
  };

  const handleManualSearch = () => {
    setHasSearched(true);
    const lawyers = mockUsers.filter(u => u.role === 'lawyer');
    
    const results = lawyers.filter(lawyer => {
      const specialtyMatch = searchSpecialty === 'ALL' || lawyer.specialties?.includes(searchSpecialty);
      const locationMatch = !searchLocation || lawyer.location?.toLowerCase().includes(searchLocation.toLowerCase());
      const budgetMatch = searchBudget === 'ALL' || (lawyer.hourlyRateRange && lawyer.hourlyRateRange[0] <= parseInt(searchBudget));
      return specialtyMatch && locationMatch && budgetMatch;
    });

    setManualSearchResults(results);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title={`Bienvenido/a al Marketplace, ${currentUser?.name}`} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna de Asignación Inteligente */}
        <Card className="shadow-xl border-primary border-2">
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Sparkles className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Asignación Inteligente (Recomendado)</CardTitle>
            </div>
            <CardDescription>
              ¿No sabe qué tipo de abogado necesita? Describa su problema y nuestra IA encontrará los mejores candidatos para usted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ej: 'Me despidieron de mi trabajo sin pagarme liquidación', 'Mi vecino construyó un muro en mi propiedad y no quiere quitarlo', 'Quiero iniciar el proceso de divorcio...'"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={6}
            />
            <Button onClick={handleAiMatch} disabled={isMatching} className="w-full">
              {isMatching ? <Loader2 className="animate-spin mr-2" /> : <Bot className="mr-2" />}
              {isMatching ? 'Analizando y Buscando...' : 'Encontrar Abogado con IA'}
            </Button>
            {suggestedLawyers && (
              <div className="pt-4 space-y-2">
                <h3 className="font-semibold text-lg">Resultados del Análisis de IA:</h3>
                <p><span className='font-medium'>Materia Identificada:</span> {suggestedLawyers.identifiedSubject}</p>
                 <p><span className='font-medium'>Recomendaciones:</span></p>
                <div className="space-y-4">
                  {suggestedLawyers.suggestedLawyers.map(lawyer => (
                    <LawyerProfileCard key={lawyer.id} lawyer={lawyer} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna de Búsqueda Manual */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className='flex items-center gap-2'>
                <Search className="h-8 w-8 text-muted-foreground" />
                <CardTitle className="text-2xl">Búsqueda Manual</CardTitle>
            </div>
            <CardDescription>
              Filtre y encuentre un abogado según sus propios criterios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Select value={searchSpecialty} onValueChange={(val) => setSearchSpecialty(val as CaseSubject | 'ALL')}>
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas las Especialidades</SelectItem>
                    {CASE_SUBJECTS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Ubicación (Ciudad o País)</Label>
                <Input id="location" placeholder="Ej: La Santísima Trinidad, Bolivia" value={searchLocation} onChange={e => setSearchLocation(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="budget">Presupuesto (Tarifa máxima por hora)</Label>
               <Select value={searchBudget} onValueChange={setSearchBudget}>
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Cualquier Presupuesto</SelectItem>
                    <SelectItem value="50">Hasta $50/hr</SelectItem>
                    <SelectItem value="100">Hasta $100/hr</SelectItem>
                    <SelectItem value="200">Hasta $200/hr</SelectItem>
                    <SelectItem value="500">Hasta $500/hr</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <Button onClick={handleManualSearch} className="w-full">
              <Search className="mr-2" /> Buscar Abogado
            </Button>
            
            {hasSearched && (
                 <div className="pt-4 space-y-2">
                 <h3 className="font-semibold text-lg">Resultados de la Búsqueda ({manualSearchResults.length}):</h3>
                {manualSearchResults.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {manualSearchResults.map(lawyer => (
                       <LawyerProfileCard key={lawyer.id} lawyer={lawyer} />
                    ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No se encontraron abogados que coincidan con sus criterios.</p>
                )}
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    