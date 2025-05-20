
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarNavProps {
  isMobile?: boolean;
  className?: string;
  onLinkClick?: () => void; // New prop to handle link clicks
}

export function SidebarNav({ isMobile = false, className, onLinkClick }: SidebarNavProps) {
  const pathname = usePathname();
  const { isAdmin, currentUser } = useAuth(); 

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cases", label: "Mis Casos", icon: Briefcase },
    ...(isAdmin ? [{ href: "/cases/new", label: "Nuevo Caso", icon: FolderPlus, adminOnly: true }] : []),
    { href: "/reminders", label: "Recordatorios", icon: CalendarCheck },
    ...(isAdmin ? [{ href: "/users", label: "Usuarios", icon: Users, adminOnly: true }] : []),
    ...(isAdmin ? [{ href: "/settings", label: "Configuración", icon: Settings }] : []), // Changed from currentUser.role === "admin"
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
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? "default" : "ghost"} 
            className={cn(
              "justify-start w-full",
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !isMobile && isActive && "bg-primary/10 text-primary hover:bg-primary/15", 
              !isMobile && !isActive && "text-foreground hover:bg-accent hover:text-accent-foreground" 
            )}
            onClick={handleItemClick} // Call handleItemClick on button click
          >
            <Link href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2">
              <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground")} />
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
