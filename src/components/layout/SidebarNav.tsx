
"use client";

// Este componente ya no es necesario si la navegación principal se mueve al Dashboard
// y el menú de hamburguesa se elimina.
// Se puede dejar vacío o eliminar del proyecto.
// Por ahora, lo dejaré vacío para evitar errores de importación.

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   LayoutDashboard,
//   Briefcase,
//   Users,
//   CalendarCheck,
//   FolderPlus,
//   Settings,
// } from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";
// import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarNavProps {
  isMobile?: boolean;
  className?: string;
  onLinkClick?: () => void; 
}

export function SidebarNav({ isMobile = false, className, onLinkClick }: SidebarNavProps) {
  return null; // Opcionalmente, eliminar este archivo completamente si no hay otras referencias.
  /*
  const pathname = usePathname();
  const { isAdmin } = useAuth(); 

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cases", label: "Mis Casos", icon: Briefcase },
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
               // Ajuste para colores cuando el sidebar está en el layout principal (no móvil)
               !isMobile && isActive && "bg-primary text-primary-foreground hover:bg-primary/90", // Color activo estándar para sidebar no móvil
               !isMobile && !isActive && "text-foreground hover:bg-accent hover:text-accent-foreground" // Color inactivo estándar para sidebar no móvil
            )}
            onClick={handleItemClick}
          >
            <Link href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2">
              <item.icon className={cn("h-5 w-5", 
                isMobile ? (isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground")
                         : (isActive ? "text-primary-foreground" : "text-foreground") // Iconos estándar para sidebar no móvil
              )} />
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
  */
}
