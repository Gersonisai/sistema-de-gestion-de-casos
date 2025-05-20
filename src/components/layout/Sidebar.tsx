
"use client";

import Link from "next/link";
import Image from "next/image";
import { SidebarNav } from "./SidebarNav";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="hidden border-r bg-sidebar md:block text-sidebar-foreground shadow-lg">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-primary-foreground">
             <Image 
               src="https://placehold.co/28x28.png" 
               alt="YASI K'ARI Logo" 
               width={28} 
               height={28} 
               data-ai-hint="lady justice scales"
             />
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
