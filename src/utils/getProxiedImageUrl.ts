export function getProxiedImageUrl(
  imageUrl: string,
  plainUrl?: boolean
): string {
  // Supabase base path you want to strip
  const basePath = '/storage/v1/object/public/develop/images/';

  // Find the image filename
  const index = imageUrl.indexOf(basePath);
  if (index === -1) return imageUrl; // fallback to original if unexpected format

  const filename = imageUrl.slice(index + basePath.length);

  return plainUrl
    ? imageUrl
    : `${process.env.EXPO_PUBLIC_BASE_URL}/images/${filename}`;
}
