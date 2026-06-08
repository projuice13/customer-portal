"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, CheckCircle, AlertCircle, PackageX } from "lucide-react";
import { ShippingZoneSection } from "@/components/postcode/ShippingZoneSection";
import type { ShippingMethod } from "@/components/postcode/ShippingMethodCard";
import { PageHeader } from "@/components/layout/PageHeader";

const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i;
const LS_KEY_FETCHED_AT = "pj_shipping_fetched_at";
const LS_KEY_ZONE_COUNT = "pj_shipping_zone_count";

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
  has_results: boolean;
  zones: ShippingZone[];
  fetched_at?: string;
  error?: string;
}

type FetchState = "idle" | "loading" | "done" | "error";

function formatFetchedAt(iso: string): string {
  const d = new Date(iso);
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function DataStatusDot({ fetchedAt }: { fetchedAt: string | null }) {
  if (!fetchedAt) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-xs text-amber-600">No data loaded — click Refresh</span>
      </div>
    );
  }
  const isStale = (Date.now() - new Date(fetchedAt).getTime()) / 3600000 > 24;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${isStale ? "bg-amber-400" : "bg-green-400"}`} />
      <span className={`text-xs ${isStale ? "text-amber-600" : "text-slate-400"}`}>
        Shipping data updated {formatFetchedAt(fetchedAt)}
      </span>
    </div>
  );
}

export default function PostcodeCheckerPage() {
  const [searchInput, setSearchInput] = useState("");
  const [activePostcode, setActivePostcode] = useState("");
  const [validationError, setValidationError] = useState("");
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY_FETCHED_AT);
    if (stored) setLastFetchedAt(stored);
  }, []);

  const { data, isLoading, isError, error } = useQuery<ShippingResponse>({
    queryKey: ["shipping", activePostcode],
    queryFn: () =>
      fetch(`/api/postcode-checker?postcode=${encodeURIComponent(activePostcode)}`).then((r) => r.json()),
    enabled: activePostcode.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.fetched_at) {
      setLastFetchedAt(data.fetched_at);
      localStorage.setItem(LS_KEY_FETCHED_AT, data.fetched_at);
    }
  }, [data?.fetched_at]);

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

  const handleRefresh = async () => {
    setFetchState("loading");
    setFetchError(null);
    try {
      const res = await fetch("/api/postcode-checker", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.fetched_at) {
        setLastFetchedAt(json.fetched_at);
        localStorage.setItem(LS_KEY_FETCHED_AT, json.fetched_at);
        if (json.zones_loaded) localStorage.setItem(LS_KEY_ZONE_COUNT, String(json.zones_loaded));
        setFetchState("done");
      } else {
        setFetchError(json.message ?? json.error ?? `HTTP ${res.status}`);
        setFetchState("error");
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Network error");
      setFetchState("error");
    }
    setTimeout(() => setFetchState("idle"), 4000);
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
            className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <PackageX className="h-8 w-8 text-slate-300" />
            <div>
              <p className="font-medium text-slate-700">No frozen shipping methods found</p>
              <p className="mt-1 text-sm text-slate-500">{data?.postcode}</p>
            </div>
          </motion.div>
        )}

        {showResults && (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="mb-4 flex items-center gap-2">
              {data?.locality && <span className="text-sm font-medium text-slate-700">{data.locality}</span>}
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-medium text-slate-600">{data?.postcode}</span>
            </div>
            <div className="flex flex-col gap-4">
              {data?.zones.map((zone, i) => (
                <ShippingZoneSection key={zone.id} zone={zone} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data status + refresh */}
      <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-4">
        <DataStatusDot fetchedAt={lastFetchedAt} />
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleRefresh}
            disabled={fetchState === "loading"}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-all disabled:cursor-not-allowed ${
              fetchState === "done" ? "border-green-200 bg-green-50 text-green-700"
              : fetchState === "error" ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {fetchState === "loading" && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />}
            {fetchState === "done" && <CheckCircle className="h-3.5 w-3.5" />}
            {fetchState === "error" && <AlertCircle className="h-3.5 w-3.5" />}
            {fetchState === "idle" && <RefreshCw className="h-3.5 w-3.5" />}
            <span>
              {fetchState === "idle" && "Refresh data"}
              {fetchState === "loading" && "Refreshing…"}
              {fetchState === "done" && "Done"}
              {fetchState === "error" && "Failed"}
            </span>
          </button>
          {fetchError && <p className="max-w-[200px] text-right text-xs text-red-500">{fetchError}</p>}
        </div>
      </div>
    </div>
  );
}
