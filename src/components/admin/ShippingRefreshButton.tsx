"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

type State = "idle" | "loading" | "done" | "error";

export function ShippingRefreshButton() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function handleRefresh() {
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/postcode-checker", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.fetched_at) {
        setMessage(`${json.zones_loaded} zones loaded`);
        setState("done");
      } else {
        setMessage(json.message ?? json.error ?? `HTTP ${res.status}`);
        setState("error");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Network error");
      setState("error");
    }
    setTimeout(() => { setState("idle"); setMessage(""); }, 5000);
  }

  return (
    <div className="flex items-center gap-3">
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
      {message && (
        <span className={`text-sm ${state === "error" ? "text-red-600" : "text-slate-500"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
