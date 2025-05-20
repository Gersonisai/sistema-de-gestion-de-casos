
'use server';
/**
 * @fileOverview Generates push notification content for case reminders.
 *
 * - generatePushNotification - A function that crafts notification messages.
 * - GeneratePushNotificationInput - The input type for the function.
 * - GeneratePushNotificationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const GeneratePushNotificationInputSchema = z.object({
  clientName: z.string().describe('The name of the client for the case.'),
  nurej: z.string().describe('The NUREJ identifier for the case.'),
  reminderMessage: z.string().describe('The content of the reminder message.'),
  reminderDateTimeISO: z
    .string()
    .datetime()
    .describe('The date and time of the reminder in ISO format.'),
  alertType: z
    .enum(['IMMINENT', 'DUE_NOW'])
    .describe(
      "The type of alert: 'IMMINENT' for a notification shortly before the reminder, 'DUE_NOW' for a notification at the exact time of the reminder."
    ),
});
export type GeneratePushNotificationInput = z.infer<typeof GeneratePushNotificationInputSchema>;

export const GeneratePushNotificationOutputSchema = z.object({
  title: z.string().describe('The concise title for the push notification.'),
  body: z
    .string()
    .describe('The main content/body of the push notification.'),
});
export type GeneratePushNotificationOutput = z.infer<typeof GeneratePushNotificationOutputSchema>;

export async function generatePushNotification(
  input: GeneratePushNotificationInput
): Promise<GeneratePushNotificationOutput> {
  return generatePushNotificationFlow(input);
}

const notificationPrompt = ai.definePrompt({
  name: 'generatePushNotificationPrompt',
  input: {schema: GeneratePushNotificationInputSchema},
  output: {schema: GeneratePushNotificationOutputSchema},
  prompt: `Eres un asistente experto en un sistema de gestión de casos legales. Tu tarea es redactar el contenido para una notificación push referente a un recordatorio de un caso.

La notificación debe ser profesional, concisa y amigable.

Tipo de Alerta: {{{alertType}}}
Cliente del Caso: {{{clientName}}}
NUREJ del Caso: {{{nurej}}}
Mensaje del Recordatorio: {{{reminderMessage}}}
Fecha y Hora del Recordatorio (ISO): {{{reminderDateTimeISO}}}

Instrucciones según el Tipo de Alerta:
- Si alertType es 'IMMINENT':
  - El título podría ser algo como: "Recordatorio Próximo: Caso {{{clientName}}}" o "Aviso: Caso {{{nurej}}}".
  - El cuerpo debe indicar que el recordatorio es pronto (ej. "En aprox. 20 minutos:", "Próximamente:") seguido del mensaje del recordatorio y la hora. Menciona el NUREJ sutilmente si no está en el título.
  - Ejemplo de cuerpo: "En aprox. 20 minutos: {{{reminderMessage}}} a las {{formatDate reminderDateTimeISO 'HH:mm' 'es'}}. NUREJ: {{{nurej}}}."

- Si alertType es 'DUE_NOW':
  - El título podría ser: "Recordatorio: Caso {{{clientName}}}" o "¡Atención!: Caso {{{nurej}}}".
  - El cuerpo debe indicar que el recordatorio es ahora (ej. "Ahora:", "Recordatorio Urgente:") seguido del mensaje del recordatorio y la hora. Menciona el NUREJ sutilmente si no está en el título.
  - Ejemplo de cuerpo: "Ahora: {{{reminderMessage}}} a las {{formatDate reminderDateTimeISO 'HH:mm' 'es'}}. NUREJ: {{{nurej}}}."

Adapta el mensaje para que sea claro y útil para el abogado o usuario que recibe la notificación.

Formatea la hora del recordatorio usando la función {{formatDate reminderDateTimeISO 'HH:mm' 'es'}} para mostrar solo la hora y minutos en el idioma español.
Asegúrate de que el resultado final esté en el formato JSON especificado por el esquema de salida.
`,
  
  // Register a Handlebars helper to format dates
  handlebars: {
    helpers: {
      formatDate: (isoDate: string, formatString: string, localeString: string) => {
        try {
          let selectedLocale = es; // Default to Spanish
          // Add more locales if needed:
          // if (localeString === 'en') selectedLocale = en;
          return format(parseISO(isoDate), formatString, { locale: selectedLocale });
        } catch (e) {
          console.error("Error formatting date in Handlebars:", e);
          return isoDate; // Fallback to ISO date string on error
        }
      },
    },
  },
  config: {
    // Optional: Adjust safety settings if needed, though default should be fine for this.
    // safetySettings: [
    //   {
    //     category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    //     threshold: 'BLOCK_NONE',
    //   },
    // ],
  }
});

const generatePushNotificationFlow = ai.defineFlow(
  {
    name: 'generatePushNotificationFlow',
    inputSchema: GeneratePushNotificationInputSchema,
    outputSchema: GeneratePushNotificationOutputSchema,
  },
  async (input) => {
    // You could add logic here to augment input if needed before calling the prompt
    const {output} = await notificationPrompt(input);
    
    if (!output) {
        throw new Error("Failed to generate notification content from prompt.");
    }
    return output;
  }
);
