"use client";

import { useState } from "react";
import type { AskAnswer } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { AskForm } from "@/components/ask/AskForm";
import { AnswerPanel } from "@/components/ask/AnswerPanel";

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setAnswer(data as AskAnswer);
      }
    } catch {
      setError("Failed to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Ask Me Anything"
        description="Ask a question about our products, ingredients, allergens, or services."
        className="mb-6"
      />

      <div className="space-y-5">
        <AskForm
          question={question}
          onChange={setQuestion}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {/* Loading state */}
        {loading && (
          <div
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5"
            aria-live="polite"
            aria-label="Generating answer"
          >
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent flex-shrink-0"
              aria-hidden="true"
            />
            <p className="text-sm text-slate-500">Looking through product information…</p>
          </div>
        )}

        <AnswerPanel answer={answer} error={error} />
      </div>

      {/* Info note */}
      <div className="mt-8 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-xs text-slate-400 leading-relaxed">
          Answers draw on live product data, delivery information, FAQs, and blog content from the
          Projuice website. For urgent queries contact us on{" "}
          <strong className="text-slate-500">01395 239500</strong> or{" "}
          <strong className="text-slate-500">info@projuice.co.uk</strong>.
        </p>
      </div>
    </div>
  );
}
