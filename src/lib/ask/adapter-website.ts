/**
 * Website adapter: searches Projuice WordPress content (pages + blog posts).
 */

import { fetchWordPressContent, scoreWpItem } from "./wp-content";

export interface WebsiteSearchResult {
  title: string;
  content: string;
  source: string;
  url: string;
  score: number;
}

// How many characters of content to include per item in the context window
const SNIPPET_LENGTH = 1200;

export async function searchWebsite(
  tokens: string[]
): Promise<WebsiteSearchResult[]> {
  const items = await fetchWordPressContent();

  return items
    .map((item) => ({ item, score: scoreWpItem(item, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ item, score }) => ({
      title: item.title,
      content: item.content.substring(0, SNIPPET_LENGTH),
      source: item.type === "post" ? "Blog post" : "Website page",
      url: item.url,
      score,
    }));
}
