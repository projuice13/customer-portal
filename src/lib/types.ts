// ─── Resource ────────────────────────────────────────────────────────────────

export type ResourceType =
  | "high-res-image"
  | "poster"
  | "spec-sheet"
  | "day-card"
  | "pdf"
  | "image-pack";

export interface Resource {
  id: string;
  type: ResourceType;
  label: string;
  url: string;
  fileType: string; // e.g. "PDF", "ZIP", "JPG"
  thumbnail?: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductType = "smoothie" | "shake" | "juice" | "other";

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: string;
  productType: ProductType;
  shortDescription: string;
  longDescription: string;
  image: string;
  ingredients: string[];
  allergens: string[];
  resources: Resource[];
  tags: string[];
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Lucide icon name
  protected?: boolean; // requires password
  comingSoon?: boolean;
  description?: string;
}

// ─── Ask Me Anything ─────────────────────────────────────────────────────────

export interface AskQuestion {
  question: string;
}

export interface AskCitation {
  label: string;
  source: string;
}

export interface AskAnswer {
  answer: string;
  citations: AskCitation[];
}

// ─── Calculator ──────────────────────────────────────────────────────────────

export interface CalculatorComponent {
  id: string;
  label: string;
  cost: number; // in pence (integer) to avoid float rounding
  editable: boolean; // label editable (for custom rows)
  removable: boolean;
}

export interface CalculatorPreset {
  id: string;
  name: string;
  components: CalculatorComponent[];
  defaultSellingPrice: number; // in pence
}

export interface CalculatorResult {
  totalCost: number;
  sellingPrice: number;
  grossProfit: number;
  marginPercent: number;
  markupPercent: number;
}
