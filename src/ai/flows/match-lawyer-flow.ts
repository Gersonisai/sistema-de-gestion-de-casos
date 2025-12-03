
'use server';
/**
 * @fileOverview Flujo de IA para encontrar el abogado adecuado para un cliente.
 *
 * - matchLawyer - Analiza el problema de un cliente y sugiere abogados.
 * - MatchLawyerInput - El tipo de entrada para la función.
 * - MatchLawyerOutput - El tipo de salida de la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { UserRole, CaseSubject, CASE_SUBJECTS_OPTIONS } from '@/lib/types';
import type { User as AppUser } from '@/lib/types';
import { getDocs, collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MatchLawyerInputSchema = z.object({
  problemDescription: z.string().describe('La descripción del problema legal del cliente.'),
  clientLocation: z.string().optional().describe('La ubicación del cliente para filtrar por geografía.'),
});
export type MatchLawyerInput = z.infer<typeof MatchLawyerInputSchema>;

// Definimos un esquema para el perfil del abogado que devolveremos
const LawyerProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.nativeEnum(UserRole),
    location: z.string().optional(),
    specialties: z.array(z.nativeEnum(CaseSubject)).optional(),
    bio: z.string().optional(),
    profilePictureUrl: z.string().optional(),
    hourlyRateRange: z.tuple([z.number(), z.number()]).optional(),
});


const MatchLawyerOutputSchema = z.object({
  identifiedSubject: z.enum(CASE_SUBJECTS_OPTIONS).describe('La materia legal principal identificada en el problema.'),
  reasoning: z.string().describe('Una breve explicación de por qué se eligió esa materia.'),
  suggestedLawyers: z.array(LawyerProfileSchema).describe('Una lista de hasta 3 perfiles de abogados recomendados.'),
});
export type MatchLawyerOutput = z.infer<typeof MatchLawyerOutputSchema>;

export async function matchLawyer(input: MatchLawyerInput): Promise<MatchLawyerOutput> {
  return matchLawyerFlow(input);
}

const matchingPrompt = ai.definePrompt({
  name: 'matchLawyerPrompt',
  input: { schema: MatchLawyerInputSchema },
  output: { schema: MatchLawyerOutputSchema },
  prompt: `Eres un asistente legal experto en triaje. Tu tarea es analizar la descripción de un problema legal proporcionada por un cliente y determinar la materia legal principal.

Descripción del Problema:
"{{{problemDescription}}}"

Basado en esta descripción, realiza lo siguiente:
1.  **Identifica la Materia Principal:** Elige la categoría legal más apropiada de la siguiente lista: ${CASE_SUBJECTS_OPTIONS.join(', ')}. Asigna este valor al campo 'identifiedSubject'.
2.  **Proporciona un Razonamiento:** En una frase corta, explica por qué crees que el problema pertenece a esa materia. Asigna esto al campo 'reasoning'.
3.  **No Sugieras Abogados**: Deja el campo 'suggestedLawyers' como un array vacío. La selección de abogados se hará después.

Ejemplo de respuesta si el problema es "me despidieron sin pagarme":
{
  "identifiedSubject": "Laboral",
  "reasoning": "El problema se relaciona con un despido y derechos laborales, lo cual corresponde a la materia Laboral.",
  "suggestedLawyers": []
}

Ahora, analiza el problema del cliente.
`,
});

const matchLawyerFlow = ai.defineFlow(
  {
    name: 'matchLawyerFlow',
    inputSchema: MatchLawyerInputSchema,
    outputSchema: MatchLawyerOutputSchema,
  },
  async (input) => {
    // 1. Usar IA para identificar la materia legal
    const { output } = await matchingPrompt(input);
    
    if (!output || !output.identifiedSubject) {
        throw new Error("La IA no pudo determinar la materia del caso.");
    }

    // 2. Buscar abogados en Firestore que coincidan con la materia.
    const lawyersRef = collection(db, "users");
    const q = query(
      lawyersRef,
      where("role", "==", UserRole.LAWYER),
      where("specialties", "array-contains", output.identifiedSubject),
      // Opcional: filtrar por ubicación si se proporciona. Firestore no soporta queries complejas como 'contains' en strings.
      // Una solución más robusta usaría Algolia o similar para búsqueda geográfica.
      // Por ahora, lo filtraremos en el cliente.
      limit(10) // Traemos hasta 10 para tener variedad.
    );

    const querySnapshot = await getDocs(q);
    const matchingLawyers = querySnapshot.docs.map(doc => doc.data() as AppUser);
    
    let suggestedLawyers = matchingLawyers;

    // Opcional: si hay una ubicación, filtrar por ella también
    if (input.clientLocation) {
        const clientLocationLower = input.clientLocation.toLowerCase();
        const locationFiltered = matchingLawyers.filter(lawyer => 
            lawyer.location?.toLowerCase().includes(clientLocationLower)
        );
        if (locationFiltered.length > 0) {
            suggestedLawyers = locationFiltered;
        }
    }

    // Tomar hasta 3 para la simulación
    const finalSuggestions = suggestedLawyers
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, 3);
    
    // 3. Devolver la materia identificada y los abogados sugeridos
    return {
        identifiedSubject: output.identifiedSubject,
        reasoning: output.reasoning,
        suggestedLawyers: finalSuggestions.map(lawyer => ({ // Mapear al esquema de salida
            id: lawyer.id,
            name: lawyer.name,
            email: lawyer.email,
            role: lawyer.role,
            location: lawyer.location,
            specialties: lawyer.specialties,
            bio: lawyer.bio,
            profilePictureUrl: lawyer.profilePictureUrl,
            hourlyRateRange: lawyer.hourlyRateRange,
        })),
    };
  }
);
