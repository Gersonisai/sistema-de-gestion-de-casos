"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page serves as a redirector to the dashboard or a specific user's case list.
// For simplicity, we'll redirect all users to the dashboard where filtering occurs.
export default function CasesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg">Redirigiendo a Casos...</p>
    </div>
  );
}
