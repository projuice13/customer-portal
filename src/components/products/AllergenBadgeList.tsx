import { cn } from "@/lib/utils";

// Colour-coded allergen badges
const allergenColours: Record<string, string> = {
  Milk: "bg-blue-50 text-blue-700 border-blue-200",
  Soya: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Gluten: "bg-orange-50 text-orange-700 border-orange-200",
  Wheat: "bg-orange-50 text-orange-700 border-orange-200",
  Nuts: "bg-red-50 text-red-700 border-red-200",
  Peanuts: "bg-red-50 text-red-700 border-red-200",
  Eggs: "bg-amber-50 text-amber-700 border-amber-200",
  Sesame: "bg-purple-50 text-purple-700 border-purple-200",
  None: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface AllergenBadgeListProps {
  allergens: string[];
  className?: string;
}

export function AllergenBadgeList({ allergens, className }: AllergenBadgeListProps) {
  if (!allergens.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="list" aria-label="Allergens">
      {allergens.map((allergen) => {
        const colourClass =
          allergenColours[allergen] ?? "bg-slate-100 text-slate-600 border-slate-200";
        return (
          <span
            key={allergen}
            role="listitem"
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              colourClass
            )}
          >
            {allergen}
          </span>
        );
      })}
    </div>
  );
}
