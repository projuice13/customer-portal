"use client";

import { motion } from "framer-motion";

export interface ShippingMethod {
  id: number;
  title: string;
  enabled: boolean;
  method_id: string;
  method_title: string;
  method_description: string;
  cost: string;
  free_shipping_threshold: string;
}

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(num);
}

function hasCost(cost: string): boolean {
  if (!cost) return false;
  const num = parseFloat(cost);
  return !isNaN(num) && num > 0;
}

export function ShippingMethodCard({ method, index }: { method: ShippingMethod; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
    >
      <span className="text-sm font-medium text-slate-900">{method.title}</span>
      {hasCost(method.cost) && (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(method.cost)}</span>
      )}
    </motion.div>
  );
}
