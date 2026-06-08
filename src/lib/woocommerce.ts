/**
 * Shared WooCommerce REST API client.
 * Credentials are read from environment variables — never exposed to the browser.
 */

export async function wcFetch<T>(
  path: string,
  params?: Record<string, string>,
  revalidate = 300
): Promise<T> {
  const baseUrl = process.env.WOOCOMMERCE_URL?.replace(/\/$/, "");
  const key = process.env.WOOCOMMERCE_KEY;
  const secret = process.env.WOOCOMMERCE_SECRET;

  if (!baseUrl) return [] as unknown as T;

  const credentials =
    key && secret
      ? "Basic " + Buffer.from(`${key}:${secret}`).toString("base64")
      : undefined;

  const url = new URL(`${baseUrl}/wp-json/wc/v3${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      ...(credentials ? { Authorization: credentials } : {}),
      "Content-Type": "application/json",
    },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
