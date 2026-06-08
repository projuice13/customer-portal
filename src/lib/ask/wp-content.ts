/**
 * Fetches and caches content from the Projuice WordPress site via the public REST API.
 * Pages and blog posts are cached for 24 hours.
 */

const WP_BASE = "https://www.projuice.co.uk/wp-json/wp/v2";

export interface WpItem {
  title: string;
  content: string; // plain text, HTML stripped
  url: string;
  type: "post" | "page";
  slug: string;
}

// Pages worth including — Elementor-built pages return empty content via REST so we
// skip anything under 150 chars after stripping.
const SKIP_PAGE_SLUGS = new Set([
  "elementor-125306",
  "shop",
  "checkout",
  "cart",
  "thanks",
  "subscribe-thanks",
  "favourites",
  "newsletter-signup",
  "videos",
  "clearance",
  "cookie-policy",
  "privacy-policy",
  "website-usage",
]);

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "\u201c")
    .replace(/&#8221;/g, "\u201d")
    .replace(/&#8211;/g, "–")
    .replace(/&#038;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function wpFetch<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const url = new URL(`${WP_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // cache 24 h
    });
    if (!res.ok) return [];
    return res.json() as Promise<T[]>;
  } catch {
    return [];
  }
}

export async function fetchWordPressContent(): Promise<WpItem[]> {
  const [rawPosts, rawPages] = await Promise.all([
    wpFetch<{ title: { rendered: string }; content: { rendered: string }; slug: string; link: string }>(
      "/posts",
      { per_page: "100", _fields: "title,content,slug,link", status: "publish" }
    ),
    wpFetch<{ title: { rendered: string }; content: { rendered: string }; slug: string; link: string }>(
      "/pages",
      { per_page: "100", _fields: "title,content,slug,link", status: "publish" }
    ),
  ]);

  const items: WpItem[] = [];

  for (const post of rawPosts) {
    const content = stripHtml(post.content?.rendered ?? "");
    if (content.length < 150) continue;
    items.push({
      title: stripHtml(post.title?.rendered ?? ""),
      content,
      url: post.link,
      type: "post",
      slug: post.slug,
    });
  }

  for (const page of rawPages) {
    if (SKIP_PAGE_SLUGS.has(page.slug)) continue;
    const content = stripHtml(page.content?.rendered ?? "");
    if (content.length < 150) continue;
    items.push({
      title: stripHtml(page.title?.rendered ?? ""),
      content,
      url: page.link,
      type: "page",
      slug: page.slug,
    });
  }

  return items;
}

/**
 * Score a WpItem by how many question tokens it contains.
 * Title matches are weighted 3×.
 */
export function scoreWpItem(item: WpItem, tokens: string[]): number {
  const titleLower = item.title.toLowerCase();
  const contentLower = item.content.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (titleLower.includes(token)) score += 3;
    else if (contentLower.includes(token)) score += 1;
  }
  return score;
}
