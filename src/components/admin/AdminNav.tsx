"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, LogOut } from "lucide-react";

export function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <Link href="/admin/products" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
        <LayoutGrid className="h-4 w-4" />
        All products
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </div>
  );
}
