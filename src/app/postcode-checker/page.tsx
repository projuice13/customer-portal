"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, PackageX, MapPin } from "lucide-react";
import { ShippingZoneSection } from "@/components/postcode/ShippingZoneSection";
import type { ShippingMethod } from "@/components/postcode/ShippingMethodCard";
import { PageHeader } from "@/components/layout/PageHeader";

const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i;
const LS_KEY_FETCHED_AT = "pj_shipping_fetched_at";

function formatPostcode(postcode: string): string {
  const clean = postcode.replace(/\s+/g, "").toUpperCase();
  return clean.length > 3 ? clean.slice(0, -3) + " " + clean.slice(-3) : clean;
}

interface ShippingZone {
  id: number;
  name: string;
  methods: ShippingMethod[];
}

interface ShippingResponse {
  postcode: string;
  locality?: string;
  council?: string;
  region?: string;
  has_results: boolean;
  zones: ShippingZone[];
  fetched_at?: string;
  error?: string;
}

export default function PostcodeCheckerPage() {
  const [searchInput, setSearchInput] = useState("");
  const [activePostcode, setActivePostcode] = useState("");
  const [validationError, setValidationError] = useState("");

  const { data, isLoading, isError, error } = useQuery<ShippingResponse>({
    queryKey: ["shipping", activePostcode],
    queryFn: () =>
      fetch(`/api/postcode-checker?postcode=${encodeURIComponent(activePostcode)}`).then((r) => r.json()),
    enabled: activePostcode.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    if (!UK_POSTCODE_RE.test(clean)) {
      setValidationError("Please enter a valid UK postcode (e.g. EX8 1AA)");
      return;
    }
    setValidationError("");
    setActivePostcode(formatPostcode(clean));
  };

  const hasFrozenMethods = data?.zones?.some((zone) =>
    zone.methods.some((m) => m.enabled && m.method_title.toLowerCase().includes("frozen"))
  );
  const showNoResults = !isLoading && !isError && data && (!data.has_results || !hasFrozenMethods);
  const showResults = !isLoading && !isError && data && data.has_results && hasFrozenMethods;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Postcode Checker"
        description="Enter a UK postcode to see available frozen delivery methods."
        className="mb-6"
      />

      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className={`relative flex items-center rounded-lg border bg-white shadow-sm transition-colors ${validationError ? "border-red-400" : "border-slate-200"}`}>
          <Search className="absolute left-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setValidationError(""); }}
            placeholder="Enter UK postcode (e.g. EX8 1AA)"
            className="w-full rounded-lg bg-transparent py-3.5 pl-11 pr-28 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoComplete="off"
            autoCapitalize="characters"
          />
          <button
            type="submit"
            className="absolute right-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            Check
          </button>
        </div>
        {validationError && <p className="mt-2 text-sm text-red-500">{validationError}</p>}
      </form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {activePostcode && isLoading && (
          <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-3 py-12 text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
            <p className="text-sm">Checking shipping zones…</p>
          </motion.div>
        )}

        {isError && (
          <motion.div key="fetch-error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-700">Error fetching shipping data</p>
              <p className="mt-1 text-sm text-red-600">{error instanceof Error ? error.message : "Something went wrong"}</p>
            </div>
          </motion.div>
        )}

        {showNoResults && (
          <motion.div key="no-results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 py-12 text-center px-4">
            <PackageX className="h-8 w-8 text-slate-300" />
            <div>
              <p className="font-medium text-slate-700">No frozen shipping methods found</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {data?.council && <span className="text-sm font-medium text-slate-600">{data.council}</span>}
                {data?.region && (
                  <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500 border border-slate-200">
                    {data.region}
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-medium text-slate-600">{data?.postcode}</span>
              </div>
              {data?.postcode && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.postcode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
                >
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  View on Google Maps
                </a>
              )}
            </div>
          </motion.div>
        )}

        {showResults && (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {data?.council && <span className="text-sm font-medium text-slate-700">{data.council}</span>}
              {data?.region && (
                <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500 border border-slate-200">
                  {data.region}
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-medium text-slate-600">{data?.postcode}</span>
              {data?.postcode && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.postcode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
                >
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  View on Google Maps
                </a>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {data?.zones.map((zone, i) => (
                <ShippingZoneSection key={zone.id} zone={zone} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
