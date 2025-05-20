
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
// import { Sidebar } from "@/components/layout/Sidebar"; // Sidebar ya no se usa
import { Header } from "@/components/layout/Header";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    // La estructura de grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] ya no es necesaria
    // Se cambia a una estructura más simple sin sidebar fija.
    <div className="flex min-h-screen w-full flex-col">
      {/* <Sidebar /> */} {/* Sidebar eliminada */}
      <Header /> {/* Header ahora no tendrá el botón de menú para el sidebar fijo */}
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
        {children}
      </main>
    </div>
  );
}
