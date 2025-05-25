
"use client"; // Added this directive

// This page is being deprecated in favor of register-organization.
// Users (consorcio admins) will register through the /register-organization flow.
// Lawyers will be added by admins or via invitation codes (future).

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RegisterPageDisabled() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new subscription flow
    router.replace('/subscribe');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-semibold mb-4">Redirigiendo...</h1>
      <p className="text-muted-foreground">
        El registro de usuarios se realiza a través de la selección de un plan de suscripción.
      </p>
    </div>
  );
}
