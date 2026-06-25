import { unstable_cache } from "next/cache";

const WC_BASE = "https://www.projuice.co.uk/wp-json/wc/v3";

export interface WcLocation {
  code: string;
  type: string;
}

export interface CachedZoneMethod {
  id: number;
  title: string;
  enabled: boolean;
  method_id: string;
  method_title: string;
  method_description: string;
  cost: string;
  free_shipping_threshold: string;
}

export interface CachedZone {
  id: number;
  name: string;
  locations: WcLocation[];
  methods: CachedZoneMethod[];
}

export interface ZonePayload {
  zones: CachedZone[];
  fetchedAt: string;
}

interface WcZone { id: number; name: string; }
interface WcMethod {
  id: number; title: string; enabled: boolean;
  method_id: string; method_title: string; method_description: string;
  settings?: { cost?: { value: string }; min_amount?: { value: string }; free_shipping_threshold?: { value: string }; };
}

async function wcFetch(path: string): Promise<unknown> {
  const key = process.env.WOOCOMMERCE_KEY ?? "";
  const secret = process.env.WOOCOMMERCE_SECRET ?? "";
  const sep = path.includes("?") ? "&" : "?";
  const url = `${WC_BASE}${path}${sep}consumer_key=${encodeURIComponent(key)}&consumer_secret=${encodeURIComponent(secret)}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`WooCommerce API error ${res.status} for ${path}`);
  return res.json();
}

async function fetchAllZoneData(): Promise<ZonePayload> {
  const zones = (await wcFetch("/shipping/zones")) as WcZone[];
  const zoneData = await Promise.all(
    zones.map(async (zone) => {
      const [locations, rawMethods] = await Promise.all([
        zone.id === 0
          ? Promise.resolve([] as WcLocation[])
          : (wcFetch(`/shipping/zones/${zone.id}/locations`) as Promise<WcLocation[]>),
        wcFetch(`/shipping/zones/${zone.id}/methods`) as Promise<WcMethod[]>,
      ]);
      const methods = rawMethods
        .filter((m) => m.enabled)
        .map((m) => ({
          id: m.id, title: m.title, enabled: m.enabled,
          method_id: m.method_id, method_title: m.method_title,
          method_description: m.method_description ?? "",
          cost: m.settings?.cost?.value ?? "",
          free_shipping_threshold: m.settings?.min_amount?.value ?? m.settings?.free_shipping_threshold?.value ?? "",
        }));
      return { id: zone.id, name: zone.name, locations, methods };
    })
  );
  return { zones: zoneData, fetchedAt: new Date().toISOString() };
}

export const getCachedZoneData = unstable_cache(fetchAllZoneData, ["shipping-zones-v1"], {
  tags: ["shipping-zones"],
  revalidate: false,
});

export interface Locality {
  council?: string;
  region?: string;
}

export async function resolveLocality(postcode: string): Promise<Locality | undefined> {
  try {
    const clean = postcode.replace(/\s+/g, "");
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
    if (!res.ok) return undefined;
    const json = (await res.json()) as { result?: { admin_district?: string; region?: string } };
    const council = json.result?.admin_district;
    const region = json.result?.region;
    if (!council && !region) return undefined;
    return { council, region };
  } catch {
    return undefined;
  }
}

function normalizePostcode(postcode: string): string {
  return postcode.replace(/\s+/g, "").toUpperCase();
}

export function formatPostcode(postcode: string): string {
  const clean = normalizePostcode(postcode);
  return clean.length > 3 ? clean.slice(0, -3) + " " + clean.slice(-3) : clean;
}

function getOutwardCode(postcode: string): string {
  return formatPostcode(postcode).split(" ")[0];
}

export function postcodeMatchesLocation(postcode: string, location: string): boolean {
  const locTrimmed = location.trim().toUpperCase();
  if (locTrimmed.includes("*")) {
    if (locTrimmed.includes(" ")) {
      const outwardPattern = locTrimmed.split(/\s+/)[0];
      return getOutwardCode(postcode) === outwardPattern;
    }
    const p = normalizePostcode(postcode);
    const prefix = normalizePostcode(locTrimmed).slice(0, -1);
    return p.startsWith(prefix);
  }
  if (locTrimmed.includes("...")) {
    const [start, end] = locTrimmed.split("...");
    const p = normalizePostcode(postcode);
    return p >= normalizePostcode(start) && p <= normalizePostcode(end);
  }
  return normalizePostcode(postcode) === normalizePostcode(locTrimmed);
}
