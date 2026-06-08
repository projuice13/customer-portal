import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WcZone {
  id: number;
  name: string;
}

interface WcZoneLocation {
  code: string;
  type: "postcode" | "country" | "state" | "continent";
}

interface WcShippingMethod {
  id: number;
  title: string;
  method_id: string;
  enabled: boolean;
  settings: {
    cost?: { value: string };
    title?: { value: string };
  };
}

export interface PostcodeResult {
  available: boolean;
  zone: string;
  methods: {
    id: number;
    title: string;
    type: "frozen" | "ambient" | "other";
    cost: string | null;
  }[];
  message?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalisePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

function validateUkPostcode(postcode: string): boolean {
  // Accepts with or without space, standard UK format
  const re = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  return re.test(postcode.trim());
}

/**
 * Match a postcode against a WooCommerce location code.
 * Supports: exact match, wildcard suffix (*), and range (LOW...HIGH).
 */
function postcodeMatchesLocation(postcode: string, locationCode: string): boolean {
  const norm = normalisePostcode(postcode);
  const code = locationCode.replace(/\s+/g, "").toUpperCase();

  // Range: e.g. "SW1A1AA...SW1Z9ZZ"
  if (code.includes("...")) {
    const [low, high] = code.split("...").map((s) => s.replace(/\s+/g, ""));
    return norm >= low && norm <= high;
  }

  // Wildcard: e.g. "SW1*" matches "SW1A1AA"
  if (code.endsWith("*")) {
    const prefix = code.slice(0, -1);
    return norm.startsWith(prefix);
  }

  // Exact
  return norm === code;
}

/**
 * Classify a shipping method as frozen, ambient, or other based on its title.
 * Adjust the keywords to match your WooCommerce method titles.
 */
function classifyMethod(title: string): "frozen" | "ambient" | "other" {
  const t = title.toLowerCase();
  // Check "non frozen" before "frozen" to avoid false positive
  if (t.includes("non frozen") || t.includes("non-frozen") || t.includes("ambient") || t.includes("standard") || t.includes("next day") || t.includes("tracked") || t.includes("dpd") || t.includes("royal mail") || t.includes("dhl")) {
    return "ambient";
  }
  if (t.includes("frozen") || t.includes("chilled") || t.includes("cold")) {
    return "frozen";
  }
  return "other";
}

// ─── WooCommerce API fetcher ──────────────────────────────────────────────────

import { wcFetch } from "@/lib/woocommerce";

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPostcode: string = body?.postcode ?? "";

    if (!rawPostcode.trim()) {
      return NextResponse.json(
        { error: "Please enter a postcode." },
        { status: 400 }
      );
    }

    if (!validateUkPostcode(rawPostcode)) {
      return NextResponse.json(
        { error: "Please enter a valid UK postcode." },
        { status: 400 }
      );
    }

    const postcode = normalisePostcode(rawPostcode);

    // 1. Get all shipping zones
    const zones = await wcFetch<WcZone[]>("/shipping/zones");

    const namedZones = zones.filter((z) => z.id !== 0);
    const restOfWorldZone = zones.find((z) => z.id === 0);

    // 2. Fetch ALL zone locations in parallel — much faster than sequential
    const zoneLocations = await Promise.all(
      namedZones.map((zone) =>
        wcFetch<WcZoneLocation[]>(`/shipping/zones/${zone.id}/locations`).then(
          (locations) => ({ zone, locations })
        )
      )
    );

    // 3. Find the best matching zone
    let matchedZone: WcZone | null = null;

    for (const { zone, locations } of zoneLocations) {
      const postcodeLocations = locations.filter((l) => l.type === "postcode");
      const countryLocations = locations.filter((l) => l.type === "country");

      // Postcode-specific zones take priority
      if (postcodeLocations.length > 0) {
        const matched = postcodeLocations.some((l) =>
          postcodeMatchesLocation(postcode, l.code)
        );
        if (matched) {
          matchedZone = zone;
          break;
        }
      }

      // Fall back to country-level (GB) zone if no postcode restrictions set
      if (!matchedZone && postcodeLocations.length === 0) {
        const gbMatch = countryLocations.some((l) => l.code === "GB");
        if (gbMatch) {
          matchedZone = zone;
        }
      }
    }

    // Use Rest of World as final fallback
    if (!matchedZone && restOfWorldZone) {
      matchedZone = restOfWorldZone;
    }

    if (!matchedZone) {
      const result: PostcodeResult = {
        available: false,
        zone: "No zone found",
        methods: [],
        message: `No delivery options were found for postcode ${rawPostcode.toUpperCase()}. Please contact us to check availability.`,
      };
      return NextResponse.json(result);
    }

    // 3. Get shipping methods for the matched zone
    const methods = await wcFetch<WcShippingMethod[]>(
      `/shipping/zones/${matchedZone.id}/methods`
    );

    const enabledMethods = methods
      .filter((m) => m.enabled)
      .map((m) => ({
        id: m.id,
        title: m.settings?.title?.value || m.title,
        type: classifyMethod(m.settings?.title?.value || m.title),
        cost: m.settings?.cost?.value ?? null,
      }));

    const result: PostcodeResult = {
      available: enabledMethods.length > 0,
      zone: matchedZone.name,
      methods: enabledMethods,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/postcode-checker]", err);

    const message =
      err instanceof Error && err.message.includes("WOOCOMMERCE_URL")
        ? "The delivery checker is not yet configured. Please contact us to check availability."
        : "Unable to check delivery options right now. Please try again or contact us.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
