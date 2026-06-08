"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

type State = "idle" | "loading" | "done" | "error";

const LS_KEY = "pj_shipping_fetched_at";

function formatFetchedAt(iso: string): string {
  const d = new Date(iso);
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ShippingRefreshButton() {
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setFetchedAt(stored);
  }, []);

  async function handleRefresh() {
    setState("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/postcode-checker", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.fetched_at) {
        setFetchedAt(json.fetched_at);
        localStorage.setItem(LS_KEY, json.fetched_at);
        setState("done");
      } else {
        setErrorMessage(json.message ?? json.error ?? `HTTP ${res.status}`);
        setState("error");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Network error");
      setState("error");
    }
    setTimeout(() => setState("idle"), 5000);
  }

  const isStale = fetchedAt ? (Date.now() - new Date(fetchedAt).getTime()) / 3600000 > 24 : false;

  return (
    <div className="flex items-center justify-between">
      {/* Last updated */}
      <div className="flex items-center gap-1.5">
        {fetchedAt ? (
          <>
            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isStale ? "bg-amber-400" : "bg-green-400"}`} />
            <span className={`text-sm ${isStale ? "text-amber-600" : "text-slate-400"}`}>
              Last updated {formatFetchedAt(fetchedAt)}
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full flex-shrink-0 bg-amber-400" />
            <span className="text-sm text-amber-600">No data loaded yet</span>
          </>
        )}
      </div>

      {/* Button + error */}
      <div className="flex items-center gap-3">
        {errorMessage && state === "error" && (
          <span className="text-sm text-red-600">{errorMessage}</span>
        )}
        <button
          onClick={handleRefresh}
          disabled={state === "loading"}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed ${
            state === "done" ? "border-green-200 bg-green-50 text-green-700"
            : state === "error" ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {state === "loading" && <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />}
          {state === "done" && <CheckCircle className="h-4 w-4" />}
          {state === "error" && <AlertCircle className="h-4 w-4" />}
          {state === "idle" && <RefreshCw className="h-4 w-4" />}
          <span>
            {state === "idle" && "Refresh now"}
            {state === "loading" && "Fetching…"}
            {state === "done" && "Done"}
            {state === "error" && "Failed"}
          </span>
        </button>
      </div>
    </div>
  );
}
