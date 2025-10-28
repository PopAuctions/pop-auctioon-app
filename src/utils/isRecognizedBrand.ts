import { ARTICLE_BRANDS_LABELS } from '@/constants';

export function isRecognizedBrand(brand: string) {
  return Object.keys(ARTICLE_BRANDS_LABELS).includes(brand);
}
