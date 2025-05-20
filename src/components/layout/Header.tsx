
"use client";

import Link from "next/link";
import {
  Bell,
  LogOut,
  // Menu, // Menu ya no se usa para un sidebar fijo/sheet
  UserCircle,
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
// Sheet y SidebarNav ya no se usan aquí si eliminamos el menú de hamburguesa
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { SidebarNav } from "./SidebarNav"; 
import { useAuth } from "@/hooks/useAuth";
// import { useState } from "react"; // useState para mobile menu ya no es necesario

export function Header() {
  const { currentUser, logout } = useAuth();
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Ya no es necesario

  // const handleMobileLinkClick = () => { // Ya no es necesario
  //   setIsMobileMenuOpen(false);
  // };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      {/* El botón de menú (SheetTrigger) se elimina */}
      {/* 
      <div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir/Cerrar menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="flex flex-col p-0 bg-sidebar text-sidebar-foreground"
          >
            <SheetHeader className="p-4 border-b border-sidebar-border">
              <SheetTitle>Menú Principal</SheetTitle>
            </SheetHeader>
            <SidebarNav isMobile={true} onLinkClick={handleMobileLinkClick} />
          </SheetContent>
        </Sheet>
      </div>
      */}

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
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
