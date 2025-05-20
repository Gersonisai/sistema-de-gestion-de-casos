
"use client";

// Este componente ya no es necesario si la navegación principal se mueve al Dashboard.
// Se puede dejar vacío o eliminar del proyecto.
// Por ahora, lo dejaré vacío para evitar errores de importación si algún archivo aún lo referencia,
// aunque el layout principal ya no lo usa.

// import Link from "next/link";
// import { SidebarNav } from "./SidebarNav";
// import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return null; // Opcionalmente, eliminar este archivo completamente si no hay otras referencias.
  /*
  return (
    <aside className="hidden border-r bg-sidebar md:block text-sidebar-foreground shadow-lg">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="font-semibold text-sidebar-primary-foreground">
            <span className="text-xl">YASI K'ARI</span>
          </Link>
        </div>
        <div className="flex-1">
          <SidebarNav />
        </div>
        <Separator className="my-2 bg-sidebar-border" />
        <div className="p-4 mt-auto">
        </div>
      </div>
    </aside>
  );
  */
}
