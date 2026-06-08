import { NextRequest, NextResponse } from "next/server";
import { getCachedZoneData, resolveLocality, postcodeMatchesLocation, formatPostcode } from "@/lib/shipping";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");

  if (!postcode?.trim()) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "postcode query parameter is required" }, { status: 400 });
  }

  if (!process.env.WOOCOMMERCE_KEY || !process.env.WOOCOMMERCE_SECRET) {
    return NextResponse.json({ error: "CONFIG_ERROR", message: "WooCommerce credentials not configured" }, { status: 500 });
  }

  try {
    const formattedPostcode = formatPostcode(postcode.trim());
    const [{ zones: allZones, fetchedAt }, locality] = await Promise.all([
      getCachedZoneData(),
      resolveLocality(formattedPostcode),
    ]);

    const matchingZones = allZones
      .filter((zone) => {
        if (zone.id === 0) return false;
        const postcodeLocations = zone.locations.filter((l) => l.type === "postcode");
        const countryLocations = zone.locations.filter((l) => l.type === "country");
        if (postcodeLocations.length > 0) {
          return postcodeLocations.some((l) => postcodeMatchesLocation(formattedPostcode, l.code));
        }
        if (countryLocations.length > 0) {
          return countryLocations.some((l) => l.code === "GB");
        }
        return false;
      })
      .filter((zone) => zone.methods.length > 0);

    const resultZones =
      matchingZones.length > 0
        ? matchingZones
        : allZones.filter((z) => z.id === 0 && z.methods.length > 0);

    return NextResponse.json({
      postcode: formattedPostcode,
      ...(locality ? { locality } : {}),
      zones: resultZones.map(({ id, name, methods }) => ({ id, name, methods })),
      has_results: resultZones.length > 0,
      fetched_at: fetchedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "FETCH_ERROR", message: err instanceof Error ? err.message : "Failed to fetch shipping data" },
      { status: 500 }
    );
  }
}

export async function POST() {
  if (!process.env.WOOCOMMERCE_KEY || !process.env.WOOCOMMERCE_SECRET) {
    return NextResponse.json({ error: "CONFIG_ERROR", message: "WooCommerce credentials not configured" }, { status: 500 });
  }
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag("shipping-zones");
    const { zones, fetchedAt } = await getCachedZoneData();
    return NextResponse.json({ success: true, zones_loaded: zones.length, fetched_at: fetchedAt });
  } catch (err) {
    return NextResponse.json(
      { error: "REFRESH_ERROR", message: err instanceof Error ? err.message : "Failed to fetch from WooCommerce" },
      { status: 500 }
    );
  }
}
