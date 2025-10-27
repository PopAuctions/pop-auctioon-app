const API_BASE = process.env.EXPO_PUBLIC_BASE_URL;

export async function fetchAuctionArticles({
  auctionId,
  brand,
  price,
  offset = 0,
  limit = 10,
  orderedIds,
}: {
  auctionId: string | number;
  brand?: string;
  price?: string;
  offset?: number;
  limit?: number;
  orderedIds?: number[];
}) {
  const params = new URLSearchParams({
    auctionId: String(auctionId),
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (brand) params.append('brand', brand);
  if (price) params.append('price', price);
  if (orderedIds) params.append('orderedIds', JSON.stringify(orderedIds));

  const res = await fetch(`${API_BASE}/api/articles/infinite?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch articles (${res.status})`);
  }

  const json = await res.json();
  return json.articles ?? [];
}
