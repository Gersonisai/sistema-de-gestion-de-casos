
"use client";

import Link from "next/link";
// import Image from "next/image"; // Removed Image import
import { SidebarNav } from "./SidebarNav";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="hidden border-r bg-sidebar md:hidden text-sidebar-foreground shadow-lg">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="font-semibold text-sidebar-primary-foreground">
             {/* Image component removed */}
            <span className="text-xl">YASI K'ARI</span>
          </Link>
        </div>
        <div className="flex-1">
          <SidebarNav />
        </div>
        <Separator className="my-2 bg-sidebar-border" />
        <div className="p-4 mt-auto">
            {/* Future elements like quick actions or profile summary can go here */}
        </div>
      </div>
    </aside>
  );
}
