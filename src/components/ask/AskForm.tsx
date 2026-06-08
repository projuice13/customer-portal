import { Send } from "lucide-react";

interface AskFormProps {
  question: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const MAX_CHARS = 1000;

export function AskForm({ question, onChange, onSubmit, loading }: AskFormProps) {
  const remaining = MAX_CHARS - question.length;
  const isOverLimit = remaining < 0;

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div>
        <label
          htmlFor="ask-question"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Your question
        </label>
        <textarea
          id="ask-question"
          value={question}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!loading && question.trim() && question.length <= MAX_CHARS) {
                onSubmit(e as unknown as React.FormEvent);
              }
            }
          }}
          placeholder="e.g. Which smoothies are vegan? What allergens are in the chocolate shake?"
          rows={4}
          disabled={loading}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
          aria-describedby="char-count"
        />
        <p
          id="char-count"
          className={`mt-1 text-right text-xs ${
            isOverLimit ? "text-red-500" : "text-slate-400"
          }`}
          aria-live="polite"
        >
          {remaining < 100 ? `${remaining} characters remaining` : "Enter to send · Shift+Enter for new line"}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !question.trim() || isOverLimit}
        className="flex items-center gap-2 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden="true"
            />
            Thinking…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" />
            Ask
          </>
        )}
      </button>
    </form>
  );
}
