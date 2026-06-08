// Server-only: parses Projuice product specification PDF files.
// Two formats are supported:
//   1. "Allergen status" format  — used by smoothie/fruit supplier (CROP'S FRUITS NV)
//   2. "Allergen Information" format — used by dairy / complex products

import { pathToFileURL } from "url";
import path from "path";

export interface PdfSpecData {
  allergens: string[];    // short labels, e.g. ["Milk", "Gluten"]. ["None"] if confirmed allergen-free.
  ingredients: string[]; // top-level ingredient strings split from declaration
}

// ─── Allergen name normalisation ─────────────────────────────────────────────

function normaliseAllergenName(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s.includes("gluten") || s.includes("wheat") || s.includes("cereal")) return "Gluten";
  if (s.includes("crustacean")) return "Crustaceans";
  if (s.includes("egg")) return "Eggs";
  if (s.includes("fish")) return "Fish";
  if (s.includes("peanut")) return "Peanuts";
  if (s.includes("soya") || s.includes("soybean") || s.includes("soybeans")) return "Soybeans";
  if ((s.includes("milk") || s.includes("dairy") || s.includes("lactose")) && !s.includes("coconut")) return "Milk";
  if (s.includes("nut") && !s.includes("peanut") && !s.includes("coconut") && !s.includes("walnut".slice(1))) return "Nuts";
  if (s.includes("celery")) return "Celery";
  if (s.includes("mustard")) return "Mustard";
  if (s.includes("sesame")) return "Sesame";
  if (s.includes("sulphur") || s.includes("sulfur") || s.includes("sulphites")) return "Sulphur Dioxide";
  if (s.includes("lupin")) return "Lupin";
  if (s.includes("mollusc") || s.includes("mollusk")) return "Molluscs";
  return raw.trim();
}

// ─── Known allergen keys (smoothie / format-1) ────────────────────────────────

const SMOOTHIE_ALLERGEN_DEFS: { key: string; label: string }[] = [
  { key: "Gluten",           label: "Gluten" },
  { key: "Crustaceans",      label: "Crustaceans" },
  { key: "Eggs",             label: "Eggs" },
  { key: "Fish",             label: "Fish" },
  { key: "Peanuts",          label: "Peanuts" },
  { key: "Soybeans",         label: "Soybeans" },
  { key: "Milk",             label: "Milk" },
  { key: "Nuts",             label: "Nuts" },
  { key: "Celery",           label: "Celery" },
  { key: "Mustard",          label: "Mustard" },
  { key: "Sesame",           label: "Sesame" },
  { key: "Sulphur dioxide",  label: "Sulphur Dioxide" },
  { key: "Lupin",            label: "Lupin" },
  { key: "Molluscs",         label: "Molluscs" },
];

// ─── Text utilities ───────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Split a comma-separated declaration at top-level commas,
 * respecting () and [] nesting.
 */
function splitTopLevelCommas(text: string): string[] {
  const parts: string[] = [];
  let parenDepth = 0;
  let bracketDepth = 0;
  let current = "";

  for (const ch of text) {
    if (ch === "(") parenDepth++;
    else if (ch === ")") parenDepth = Math.max(0, parenDepth - 1);
    else if (ch === "[") bracketDepth++;
    else if (ch === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (ch === "," && parenDepth === 0 && bracketDepth === 0) {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      current = "";
      continue;
    }
    current += ch;
  }

  const last = current.trim().replace(/\.$/, "").trim();
  if (last) parts.push(last);
  return parts.filter((s) => s.length > 0);
}

// ─── PDF text extraction ──────────────────────────────────────────────────────

let pdfjsLib: typeof import("pdfjs-dist") | null = null;
let workerConfigured = false;

async function getPdfjsLib(): Promise<typeof import("pdfjs-dist")> {
  if (!pdfjsLib) {
    // Dynamic import avoids webpack bundling this ESM for the client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as "pdfjs-dist");
  }
  if (!workerConfigured) {
    const workerPath = path.resolve(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
    workerConfigured = true;
  }
  return pdfjsLib!;
}

async function extractText(pdfUrl: string): Promise<string> {
  const res = await fetch(pdfUrl, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next: { revalidate: 86400 } as any, // cache PDFs for 24 h
  });
  if (!res.ok) throw new Error(`PDF fetch error ${res.status} for ${pdfUrl}`);
  const buf = await res.arrayBuffer();

  const lib = await getPdfjsLib();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = await (lib as any).getDocument({ data: new Uint8Array(buf) }).promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    text += content.items.map((item: any) => ("str" in item ? item.str : "")).join(" ") + "\n";
  }
  return text;
}

// ─── Format 1: "Allergen status" (CROP'S Fruits NV smoothie/fruit supplier) ──

function parseSmothieFormat(text: string): PdfSpecData {
  // Allergen section ends at "Nutritional data" or similar
  const sectionMatch = text.match(
    /Allergen status([\s\S]*?)(?:Nutritional data|Nutritional Information|Composition Code|CROP'S|$)/i
  );
  const section = sectionMatch?.[1] ?? "";

  // Each absent allergen is followed by " - " (possibly with extra compound-name words first)
  // e.g. "Sesame seeds   - " or "Sulphur dioxide / sulphites   - "
  // If the allergen is present there is no " - " pattern immediately after it.
  const allergens: string[] = [];
  for (const { key, label } of SMOOTHIE_ALLERGEN_DEFS) {
    const idx = section.indexOf(key);
    if (idx !== -1) {
      const tail = section.substring(idx + key.length, idx + key.length + 50);
      // Pattern: optional compound-name words then whitespace then "-"
      const absent = /[\s\w/]*\s+-/.test(tail);
      if (!absent) allergens.push(label);
    }
  }

  // Declaration section: "Declaration  ingredient1, ingredient2, ..."
  const declMatch = text.match(/Declaration\s+([\s\S]*?)(?:Composition Code|CROP'S|$)/i);
  let ingredients: string[] = [];
  if (declMatch) {
    ingredients = splitTopLevelCommas(normalize(declMatch[1]));
  }

  return {
    allergens: allergens.length > 0 ? allergens : ["None"],
    ingredients,
  };
}

// ─── Format 2: "Allergen Information" table (dairy / complex products) ────────

function parseDairyFormat(text: string): PdfSpecData {
  // "Product contains: Milk" is the most direct allergen declaration in this format.
  // If N/A, no allergens.
  let allergens: string[] = [];
  const containsMatch = text.match(/Product contains:\s*([^.]+?)(?:\s+For allergens|\.|$)/i);
  if (containsMatch) {
    const raw = containsMatch[1].trim();
    if (!/^N\/A$/i.test(raw)) {
      allergens = raw
        .split(",")
        .map((s) => normaliseAllergenName(s))
        .filter((s) => s.length > 0)
        // Deduplicate
        .filter((v, i, arr) => arr.indexOf(v) === i);
    }
  }

  // Ingredient declaration: after "Ingredient Declaration ... :" or just "Declaration"
  const declMatch =
    text.match(/Ingredient Declaration[^:]*:([\s\S]*?)(?:Product contains:|For allergens|Nutritional Information|$)/i) ??
    text.match(/Declaration\s+([\s\S]*?)(?:Product contains:|For allergens|Nutritional Information|Composition Code|$)/i);
  let ingredients: string[] = [];
  if (declMatch) {
    ingredients = splitTopLevelCommas(normalize(declMatch[1]));
  }

  return {
    allergens: allergens.length > 0 ? allergens : ["None"],
    ingredients,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches the PDF at `pdfUrl`, extracts text, and parses allergens + ingredients.
 * Returns empty arrays on failure (soft-fail so product still appears).
 */
export async function parsePdfSpecSheet(pdfUrl: string): Promise<PdfSpecData> {
  const text = await extractText(pdfUrl);

  if (/Allergen status/i.test(text)) {
    return parseSmothieFormat(text);
  }
  if (/Allergen Information|Allergen Present In/i.test(text)) {
    return parseDairyFormat(text);
  }

  // Unrecognised format — return empty rather than throw
  console.warn(`[pdf-parser] Unrecognised PDF format for ${pdfUrl}`);
  return { allergens: [], ingredients: [] };
}
