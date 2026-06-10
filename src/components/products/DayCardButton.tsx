"use client";

import { useEffect, useState } from "react";
import { ResourceButton } from "./ResourceButton";
import type { DayCardEntry } from "@/lib/day-cards";

export function DayCardButton({ slug }: { slug: string }) {
  const [card, setCard] = useState<DayCardEntry | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCard(null);
    fetch(`/api/day-card/${slug}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setCard(data.card ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  if (!card) return null;

  return (
    <ResourceButton
      resource={{
        id: "day-card",
        type: "day-card",
        label: "Of the Day Card",
        url: card.url,
        fileType: "PDF",
      }}
    />
  );
}
