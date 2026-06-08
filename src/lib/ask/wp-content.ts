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
  fullContent?: boolean; // if true, always send full content (no snippet)
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

// Pages that need to be fetched as fully-rendered HTML because their content
// lives in Elementor accordions/widgets that the REST API can't return properly.
const SCRAPE_PAGES: { slug: string; url: string; title: string }[] = [
  { slug: "delivery-information", url: "https://www.projuice.co.uk/delivery-information/", title: "Delivery Information" },
  { slug: "frequently-asked-questions", url: "https://www.projuice.co.uk/frequently-asked-questions/", title: "Frequently Asked Questions" },
  { slug: "about-us", url: "https://www.projuice.co.uk/about-us/", title: "About Us" },
  { slug: "contact-us", url: "https://www.projuice.co.uk/contact-us/", title: "Contact Us" },
];

async function scrapePageHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ProJuice-Portal/1.0)" },
    });
    if (!res.ok) return "";
    const html = await res.text();
    // Extract just the main content area to avoid menus/footers etc
    // Strategy: find <main> or <article> content if present, else fall back to body
    let target = html;
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) target = mainMatch[1];
    else {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) target = bodyMatch[1];
    }
    // Remove script and style tags entirely
    target = target.replace(/<script[\s\S]*?<\/script>/gi, " ");
    target = target.replace(/<style[\s\S]*?<\/style>/gi, " ");
    target = target.replace(/<nav[\s\S]*?<\/nav>/gi, " ");
    target = target.replace(/<footer[\s\S]*?<\/footer>/gi, " ");
    target = target.replace(/<header[\s\S]*?<\/header>/gi, " ");
    return stripHtml(target);
  } catch {
    return "";
  }
}

export async function fetchWordPressContent(): Promise<WpItem[]> {
  const [rawPosts, rawPages, scrapedPages] = await Promise.all([
    wpFetch<{ title: { rendered: string }; content: { rendered: string }; slug: string; link: string }>(
      "/posts",
      { per_page: "100", _fields: "title,content,slug,link", status: "publish" }
    ),
    wpFetch<{ title: { rendered: string }; content: { rendered: string }; slug: string; link: string }>(
      "/pages",
      { per_page: "100", _fields: "title,content,slug,link", status: "publish" }
    ),
    Promise.all(
      SCRAPE_PAGES.map(async (page) => ({
        title: page.title,
        slug: page.slug,
        url: page.url,
        content: await scrapePageHtml(page.url),
      }))
    ),
  ]);

  const items: WpItem[] = [];
  const scrapedSlugs = new Set(scrapedPages.filter((p) => p.content.length > 0).map((p) => p.slug));

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
    // Skip pages where we have a scraped version with better content
    if (scrapedSlugs.has(page.slug)) continue;
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

  // Add the fully-scraped pages (these always win over the REST API version)
  for (const scraped of scrapedPages) {
    if (scraped.content.length < 150) continue;
    items.push({
      title: scraped.title,
      content: scraped.content,
      url: scraped.url,
      type: "page",
      slug: scraped.slug,
      fullContent: true,
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
