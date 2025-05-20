
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  LogOut,
  Menu,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { SidebarNav } from "./SidebarNav"; 

export function Header() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      {/* Wrapper for SheetTrigger, always visible */}
      <div>
        <Sheet>
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
            <SidebarNav isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Image 
              src="https://placehold.co/24x24.png" 
              alt="YASI K'ARI Logo" 
              width={24} 
              height={24} 
              data-ai-hint="layers icon"
            />
          <span className="sr-only">YASI K'ARI</span>
        </Link>
        <Link href="/dashboard" className="text-xl font-semibold ml-2 hover:text-primary transition-colors">
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

