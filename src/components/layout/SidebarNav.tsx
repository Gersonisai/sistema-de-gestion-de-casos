
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarCheck,
  FolderPlus,
  Settings,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarNavProps {
  isMobile?: boolean;
  className?: string;
  onLinkClick?: () => void; 
}

export function SidebarNav({ isMobile = false, className, onLinkClick }: SidebarNavProps) {
  const pathname = usePathname();
  const { isAdmin, isClient } = useAuth(); 

  if (isClient) {
      return null; // No mostrar sidebar para clientes
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "Mensajes", icon: MessageSquare },
    { href: "/cases", label: "Gestión de Casos", icon: Briefcase },
    ...(isAdmin ? [{ href: "/cases/new", label: "Nuevo Caso", icon: FolderPlus, adminOnly: true }] : []),
    { href: "/reminders", label: "Recordatorios", icon: CalendarCheck },
    ...(isAdmin ? [{ href: "/users", label: "Usuarios", icon: Users, adminOnly: true }] : []),
    ...(isAdmin ? [{ href: "/settings", label: "Configuración", icon: Settings }] : []),
  ];

  const handleItemClick = () => {
    if (isMobile && onLinkClick) {
      onLinkClick();
    }
  };

  const NavContent = () => (
    <nav className={cn("flex flex-col gap-2 p-4 text-sm font-medium", className)}>
      {navItems.map((item) => {
        if (!item) return null; 
        const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? "secondary" : "ghost"} 
            className="justify-start w-full"
            onClick={handleItemClick}
          >
            <Link href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2">
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
  
  if (isMobile) {
    return <NavContent />;
  }

  return (
    <ScrollArea className="h-full">
      <NavContent />
    </ScrollArea>
  );
}
