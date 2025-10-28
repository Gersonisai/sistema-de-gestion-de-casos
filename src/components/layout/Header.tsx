
"use client";

import Link from "next/link";
import {
  Bell,
  LogOut,
  UserCircle,
  Menu, 
  Landmark, 
  Settings as SettingsIcon,
  MessageSquare,
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
  const { currentUser, logout, isAdmin, isClient } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      
      {!isClient && (
        <div className="md:hidden"> 
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir/Cerrar menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="flex flex-col p-0 bg-background w-[280px] sm:w-[320px]"
            >
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Menú Principal</SheetTitle>
              </SheetHeader>
              <SidebarNav isMobile={true} onLinkClick={handleMobileLinkClick} />
            </SheetContent>
          </Sheet>
        </div>
      )}
      

      <div className="flex w-full items-center gap-4 md:ml-0"> 
        <Link href="/dashboard" className="text-xl font-semibold hover:text-primary transition-colors">
          YASI K'ARI
        </Link>
        <div className="ml-auto flex items-center gap-2">
           <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/chat">
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Chat</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {currentUser?.profilePictureUrl ? (
                  <img src={currentUser.profilePictureUrl} alt="Perfil" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-6 w-6" />
                )}
                <span className="sr-only">Menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {currentUser?.name || "Usuario"}
                <p className="text-xs text-muted-foreground font-normal">{currentUser?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
              )}
               <DropdownMenuItem asChild>
                  <Link href="/chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Mensajes
                  </Link>
                </DropdownMenuItem>
              {!isClient && (
                <DropdownMenuItem asChild>
                  <Link href="/subscribe">
                    <Landmark className="mr-2 h-4 w-4" />
                    Planes y Suscripción
                  </Link>
                </DropdownMenuItem>
              )}
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
