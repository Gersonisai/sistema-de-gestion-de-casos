"use client";

import Link from "next/link";
import { SidebarNav } from "./SidebarNav";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="hidden border-r bg-sidebar md:block text-sidebar-foreground shadow-lg">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-primary-foreground">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl">KariGest</span>
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
