import { wcFetch } from "./woocommerce";
import type { Product, ProductType, Resource } from "./types";

// ─── Target categories ────────────────────────────────────────────────────────

const TARGET_CATEGORIES: { id: number; label: string; productType: ProductType }[] = [
  { id: 57,  label: "Smoothies",    productType: "smoothie" },
  { id: 33,  label: "Shakes",       productType: "shake"    },
  { id: 447, label: "Soups",        productType: "other"    },
  { id: 42,  label: "Frozen Fruit", productType: "other"    },
  { id: 27,  label: "Waffles",      productType: "other"    },
  { id: 604, label: "Paninis",      productType: "other"    },
];

const TARGET_CATEGORY_IDS = new Set(TARGET_CATEGORIES.map((c) => c.id));

// ─── WooCommerce types ────────────────────────────────────────────────────────

interface WcProduct {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  categories: { id: number; name: string; slug: string }[];
  images: { src: string; alt: string }[];
  attributes: { name: string; options: string[] }[];
  tags: { name: string }[];
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201c")
    .replace(/&#8221;/g, "\u201d")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns true if the product should be excluded (POS/promo items) */
function isExcluded(product: WcProduct): boolean {
  const name = product.name.toLowerCase();
  const excludedTerms = [
    "bundle", "starter kit", "soup kettle",
    "pos pack", "pavement sign", "menu board", "a-board", "a board",
    "promo material", "promotional material", "display stand",
    "shelf talker", "window sticker",
    "200 pack of pet cups",
    "mixing juice", "frozen yogurt", "frozen yoghurt",
  ];
  if (excludedTerms.some((t) => name.includes(t))) return true;

  // Also exclude if the Product Type attribute is solely promotional
  const typeAttr = product.attributes.find((a) => a.name === "Product Type");
  if (typeAttr) {
    const types = typeAttr.options.map((o) => o.toLowerCase());
    const hasProductContent = types.some(
      (t) => !t.includes("promotional") && !t.includes("promo") && !t.includes("bundle")
    );
    if (!hasProductContent && types.some((t) => t.includes("promotional") || t.includes("bundle"))) {
      return true;
    }
  }

  return false;
}

/** Extracts the first .pdf href from WooCommerce product description HTML */
function extractPdfUrl(description: string): string | null {
  const match = description.match(/href="([^"]+\.pdf)"/i);
  return match?.[1] ?? null;
}

function mapProduct(wc: WcProduct): { product: Product; pdfUrl: string | null } {
  // Determine display category from first matching target category
  const matchedCat = wc.categories.find((c) => TARGET_CATEGORY_IDS.has(c.id));
  const catConfig = TARGET_CATEGORIES.find((t) => t.id === matchedCat?.id);

  const category = catConfig?.label ?? matchedCat?.name ?? "Other";
  const productType: ProductType = catConfig?.productType ?? "other";

  // Tags from WC tags + Smoothie Type / Smoothie Colour attributes
  const tags = [
    ...wc.tags.map((t) => t.name),
    ...(wc.attributes.find((a) => a.name === "Smoothie Type")?.options ?? []),
    ...(wc.attributes.find((a) => a.name === "Smoothie Colour")?.options ?? []),
  ].filter((v, i, arr) => arr.indexOf(v) === i); // dedupe

  const shortDescription = stripHtml(wc.short_description);

  // Spec sheet PDF from product description HTML
  const pdfUrl = extractPdfUrl(wc.description);
  const resources: Resource[] = pdfUrl
    ? [{ id: "spec-sheet", type: "spec-sheet", label: "Spec Sheet", url: pdfUrl, fileType: "PDF" }]
    : [];

  const product: Product = {
    id: String(wc.id),
    slug: wc.slug,
    title: wc.name,
    category,
    productType,
    shortDescription: shortDescription || wc.name,
    longDescription: stripHtml(wc.description),
    image: wc.images[0]?.src ?? "/products/placeholder.svg",
    ingredients: [], // populated below from PDF
    allergens: [],   // populated below from PDF
    resources,
    tags,
  };

  return { product, pdfUrl };
}

// ─── Main fetch function ──────────────────────────────────────────────────────

export async function fetchPortalProducts(): Promise<Product[]> {
  // Fetch all target categories in parallel, 100 products each
  const results = await Promise.all(
    TARGET_CATEGORIES.map(({ id }) =>
      wcFetch<WcProduct[]>("/products", {
        category: String(id),
        per_page: "100",
        status: "publish",
      }, 600) // cache 10 minutes
    )
  );

  // Flatten, deduplicate by ID, exclude promo items
  const seen = new Set<number>();
  const products: Product[] = [];

  for (const batch of results) {
    for (const wc of batch) {
      if (seen.has(wc.id)) continue;
      seen.add(wc.id);
      if (!isExcluded(wc)) {
        const { product } = mapProduct(wc);
        products.push(product);
      }
    }
  }

  // Sort alphabetically within each category
  return products.sort((a, b) =>
    a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
  );
}
