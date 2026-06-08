"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertCircle, CheckCircle, MapPin } from "lucide-react";
import type { PostcodeResult } from "@/app/api/postcode-checker/route";
import { cn } from "@/lib/utils";

function formatCost(cost: string | null): string {
  if (!cost || cost === "0" || cost === "") return "Free";
  const num = parseFloat(cost);
  if (isNaN(num)) return cost;
  return `£${num.toFixed(2)}`;
}

const typeConfig = {
  frozen: {
    bg: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    badgeLabel: "Frozen",
  },
  ambient: {
    bg: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    badgeLabel: "Ambient",
  },
  other: {
    bg: "bg-slate-50 border-slate-200",
    badge: "bg-slate-100 text-slate-600",
    badgeLabel: "Delivery",
  },
};

export default function PostcodeCheckerPage() {
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState<PostcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!postcode.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/postcode-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data as PostcodeResult);
      }
    } catch {
      setError("Failed to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Postcode Checker"
        description="Enter a UK postcode to see which delivery options are available."
        className="mb-6"
      />

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
        <div className="relative flex-1">
          <label htmlFor="postcode-input" className="sr-only">
            Postcode
          </label>
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="postcode-input"
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            placeholder="e.g. LS1 1BA"
            maxLength={8}
            autoComplete="postal-code"
            spellCheck={false}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !postcode.trim()}
          className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Checking…" : "Check"}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-500" aria-live="polite">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"
            aria-hidden="true"
          />
          Checking delivery options…
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-3" aria-live="polite">
          {/* Zone + availability badge */}
          <div className="flex items-center gap-2">
            {result.available ? (
              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" aria-hidden="true" />
            )}
            <p className="text-sm font-medium text-slate-700">
              {result.available
                ? `Delivery available to ${postcode}`
                : `No delivery options found for ${postcode}`}
            </p>
          </div>

          {result.message && (
            <p className="text-sm text-slate-500">{result.message}</p>
          )}

          {/* Method cards */}
          {result.methods.map((method) => {
            const config = typeConfig[method.type];
            return (
              <div
                key={method.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4",
                  config.bg
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{method.title}</p>
                  <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium", config.badge)}>
                    {config.badgeLabel}
                  </span>
                </div>
                {method.cost !== null && (
                  <p className="flex-shrink-0 text-sm font-semibold text-slate-700">
                    {formatCost(method.cost)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
