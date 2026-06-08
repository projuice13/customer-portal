/**
 * Local adapter: searches live WooCommerce products for content relevant to the question.
 */

import { fetchPortalProducts } from "@/lib/woo-products";
import type { Product } from "@/lib/types";

export interface LocalSearchResult {
  title: string;
  content: string;
  source: string;
  score: number;
}

/**
 * Build an aggregate summary of the catalogue so Claude can answer counting
 * and "what's available" questions without needing every product in context.
 */
function buildCatalogueSummary(products: Product[]): LocalSearchResult {
  const byCategory = new Map<string, Product[]>();
  for (const p of products) {
    const arr = byCategory.get(p.category) ?? [];
    arr.push(p);
    byCategory.set(p.category, arr);
  }

  const lines: string[] = [];
  lines.push(`Total products: ${products.length}`);
  lines.push("");
  lines.push("Breakdown by category:");

  // Collect all unique tags too (vegan, gluten-free, etc.) per category
  for (const [category, list] of [...byCategory.entries()].sort()) {
    lines.push(`- ${category}: ${list.length} products`);
    // List every product title under each category
    for (const p of list) {
      const tagInfo = p.tags.length > 0 ? ` [${p.tags.join(", ")}]` : "";
      lines.push(`    • ${p.title}${tagInfo}`);
    }
  }

  // Count by dietary tag across the whole catalogue
  const tagCounts = new Map<string, number>();
  for (const p of products) {
    for (const tag of p.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  if (tagCounts.size > 0) {
    lines.push("");
    lines.push("Products by tag:");
    for (const [tag, count] of [...tagCounts.entries()].sort((a, b) => b[1] - a[1])) {
      lines.push(`- ${tag}: ${count}`);
    }
  }

  return {
    title: "Product Catalogue Overview",
    content: lines.join("\n"),
    source: "Product catalogue",
    score: 1000, // Always include first
  };
}

export async function searchLocal(question: string, tokens: string[]): Promise<LocalSearchResult[]> {
  const products = await fetchPortalProducts();

  // Always include the catalogue overview so Claude can answer counting questions
  const overview = buildCatalogueSummary(products);

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

    return { product: p, score };
  });

  const matches: LocalSearchResult[] = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ product, score }) => {
      const parts = [`Category: ${product.category}`];
      if (product.tags.length) parts.push(`Tags: ${product.tags.join(", ")}`);
      if (product.shortDescription) parts.push(product.shortDescription);
      if (product.allergens.length) parts.push(`Allergens: ${product.allergens.join(", ")}`);
      if (product.ingredients.length) parts.push(`Ingredients: ${product.ingredients.slice(0, 8).join(", ")}`);
      return { title: product.title, content: parts.join(". "), source: "Product catalogue", score };
    });

  return [overview, ...matches];
}
