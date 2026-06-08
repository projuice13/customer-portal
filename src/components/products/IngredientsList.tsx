interface IngredientsListProps {
  ingredients: string[];
}

export function IngredientsList({ ingredients }: IngredientsListProps) {
  if (!ingredients.length) return null;

  return (
    <ul
      className="space-y-1"
      aria-label="Ingredients"
    >
      {ingredients.map((ingredient, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm text-slate-600"
        >
          <span
            className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400"
            aria-hidden="true"
          />
          {ingredient}
        </li>
      ))}
    </ul>
  );
}
