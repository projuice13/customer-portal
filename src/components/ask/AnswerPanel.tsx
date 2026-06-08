import { AlertCircle, ExternalLink, BookOpen } from "lucide-react";
import type { AskAnswer } from "@/lib/types";

interface AnswerPanelProps {
  answer: AskAnswer | null;
  error: string | null;
}

export function AnswerPanel({ answer, error }: AnswerPanelProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
      >
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!answer) return null;

  const paragraphs = answer.answer
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      role="region"
      aria-label="Answer"
      className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
    >
      {/* Answer text */}
      <div className="space-y-2.5">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Citations */}
      {answer.citations.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Sources
          </p>
          <div className="flex flex-wrap gap-1.5">
            {answer.citations.map((c, i) => {
              const isUrl = c.source.startsWith("http");
              const inner = (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 transition-colors">
                  {isUrl ? (
                    <ExternalLink className="h-3 w-3 text-slate-400 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <BookOpen className="h-3 w-3 text-slate-400 flex-shrink-0" aria-hidden="true" />
                  )}
                  {c.label}
                </span>
              );
              return isUrl ? (
                <a
                  key={i}
                  href={c.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View source: ${c.source}`}
                >
                  {inner}
                </a>
              ) : (
                <span key={i}>{inner}</span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
