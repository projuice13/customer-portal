"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { ShippingMethodCard, type ShippingMethod } from "./ShippingMethodCard";

interface Zone {
  id: number;
  name: string;
  methods: ShippingMethod[];
}

export function ShippingZoneSection({ zone, index }: { zone: Zone; index: number }) {
  const frozenMethods = zone.methods.filter(
    (m) => m.enabled && m.method_title.toLowerCase().includes("frozen")
  );

  if (frozenMethods.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="overflow-hidden rounded-lg border border-slate-200"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <MapPin className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {zone.name}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {frozenMethods.map((method, i) => (
          <ShippingMethodCard key={method.id} method={method} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
