"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { navItems } from "@/data/nav";

function ProJuiceLogo() {
  return (
    <Link href="/" className="flex items-center select-none" aria-label="Projuice home">
      <Image
        src="/logo.png"
        alt="Projuice"
        width={140}
        height={48}
        className="h-10 w-auto"
        priority
      />
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItems = navItems.filter((item) => !item.comingSoon);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#00334C]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <ProJuiceLogo />

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            {activeItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors rounded-md",
                    active
                      ? "text-[#FBB03F]"
                      : "text-white/80 hover:text-white"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {item.protected && (
                    <Lock className="h-3 w-3 opacity-60" aria-label="Password protected" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden rounded-md p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-white/10 bg-[#00334C] px-4 py-3"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {activeItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "text-[#FBB03F]"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {item.protected && (
                    <Lock className="h-3.5 w-3.5 opacity-50" aria-label="Password protected" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
