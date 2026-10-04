"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FloatingDockItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function FloatingDock({ items, className }: { items: FloatingDockItem[]; className?: string }) {
  return (
    <nav aria-label="Primary navigation" className={cn("fixed bottom-5 left-1/2 z-20 -translate-x-1/2 lg:hidden", className)}>
      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-elevated/90 p-1.5 shadow-2xl backdrop-blur-xl">
        {items.map((item) => (
          <Link key={item.href} href={item.href} title={item.title} className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
            {item.icon}
            <span className="sr-only">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
