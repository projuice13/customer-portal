/**
 * Local adapter: searches live WooCommerce products for content relevant to the question.
 */

import { fetchPortalProducts } from "@/lib/woo-products";

export interface LocalSearchResult {
  title: string;
  content: string;
  source: string;
  score: number;
}

export async function searchLocal(question: string, tokens: string[]): Promise<LocalSearchResult[]> {
  const products = await fetchPortalProducts();

  const scored = products.map((p) => {
    const titleLower = p.title.toLowerCase();
    const haystack = [
      p.title,
      p.shortDescription,
      p.category,
      ...p.tags,
      ...p.allergens,
      ...p.ingredients,
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const token of tokens) {
      if (titleLower.includes(token)) score += 4;
      else if (haystack.includes(token)) score += 1;
    }

    return {
      product: p,
      score,
    };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ product, score }) => {
      const parts = [`Category: ${product.category}`];
      if (product.shortDescription) parts.push(product.shortDescription);
      if (product.allergens.length) parts.push(`Allergens: ${product.allergens.join(", ")}`);
      if (product.ingredients.length) parts.push(`Ingredients: ${product.ingredients.slice(0, 8).join(", ")}`);

      return {
        title: product.title,
        content: parts.join(". "),
        source: "Product catalogue",
        score,
      };
    });
}
