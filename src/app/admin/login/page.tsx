"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 ring-4 ring-slate-200">
            <Lock className="h-5 w-5 text-slate-600" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-center text-xl font-semibold text-slate-900">Admin</h1>
        <p className="mt-1.5 text-center text-sm text-slate-500">
          Enter the admin password to continue.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition"
                placeholder="Enter admin password"
                autoComplete="current-password"
                autoFocus
                required
                aria-describedby={error ? "password-error" : undefined}
                aria-invalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <p id="password-error" role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-md bg-slate-800 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
