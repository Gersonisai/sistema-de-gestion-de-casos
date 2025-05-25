
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { LandingPage } from "@/components/landing/LandingPage"; // Import the new LandingPage

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isClientCheckComplete, setIsClientCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsClientCheckComplete(true);
      if (isAuthenticated) {
        router.replace("/dashboard");
      }
      // If not authenticated, we will render the LandingPage component
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isClientCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Cargando YASI K'ARI...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // This part should ideally not be reached if isAuthenticated is true due to router.replace,
  // but it's a fallback or for the brief moment before replace happens.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-foreground">Redirigiendo...</p>
    </div>
  );
}
