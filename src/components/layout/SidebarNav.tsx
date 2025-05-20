
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
}

export function SidebarNav({ isMobile = false, className }: SidebarNavProps) {
  const pathname = usePathname();
  const { isAdmin, currentUser } = useAuth(); // Added currentUser

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cases", label: "Mis Casos", icon: Briefcase },
    ...(isAdmin ? [{ href: "/cases/new", label: "Nuevo Caso", icon: FolderPlus, adminOnly: true }] : []),
    { href: "/reminders", label: "Recordatorios", icon: CalendarCheck },
    ...(isAdmin ? [{ href: "/users", label: "Usuarios", icon: Users, adminOnly: true }] : []),
    // Conditionally show Settings based on user role as per original intent in Header
    ...(currentUser?.role === "admin" ? [{ href: "/settings", label: "Configuración", icon: Settings }] : []),
  ];

  const NavContent = () => (
    <nav className={cn("flex flex-col gap-2 p-4 text-sm font-medium", className)}>
      {navItems.map((item) => {
        if (!item) return null; // Ensure item is not undefined before rendering
        return (
          <Button
            key={item.href}
            asChild
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "justify-start",
              pathname === item.href && "bg-primary/10 text-primary hover:bg-primary/15",
              !pathname.startsWith(item.href) && "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
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
