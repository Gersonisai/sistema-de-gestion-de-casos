
"use client";

import Link from "next/link";
import {
  Bell,
  LogOut,
  UserCircle,
  Menu, // Re-añadido para el menú móvil
  Landmark, // Icono para Suscripciones/Planes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav"; 
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function Header() {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      
      <div className="md:hidden"> {/* Menú de hamburguesa solo en móvil */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir/Cerrar menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="flex flex-col p-0 bg-sidebar text-sidebar-foreground w-[280px] sm:w-[320px]" // Ajustar ancho si es necesario
          >
            <SheetHeader className="p-4 border-b border-sidebar-border">
              <SheetTitle className="text-sidebar-foreground">Menú Principal</SheetTitle>
            </SheetHeader>
            <SidebarNav isMobile={true} onLinkClick={handleMobileLinkClick} />
          </SheetContent>
        </Sheet>
      </div>
      

      <div className="flex w-full items-center gap-4 md:ml-0"> {/* md:ml-0 para que no haya tanto margen */}
        <Link href="/dashboard" className="text-xl font-semibold hover:text-primary transition-colors">
          YASI K'ARI
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {currentUser?.name || "Usuario"}
                <p className="text-xs text-muted-foreground font-normal">{currentUser?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/subscribe">
                  <Landmark className="mr-2 h-4 w-4" />
                  Planes y Suscripción
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
