import { AuctionCategories, AuctionCategoriesConst } from '@/types/types';
import { ArticleFormValues } from './schemas/articleSchemas';

export function mapArticleToFormValues<C extends AuctionCategories>(
  category: C,
  article: any
): ArticleFormValues<C> {
  // Campos comunes
  const base = {
    title: article.title ?? '',
    state: article.state ?? '',
    startingPrice: article.startingPrice ? String(article.startingPrice) : '',
    estimatedValue: article.estimatedValue
      ? String(article.estimatedValue)
      : '',
    reservePrice: article.reservePrice ? String(article.reservePrice) : '',
    description: article.description ?? '',
    observations: article.observations ?? '',
    images: '',
    codeNumber: article.codeNumber ?? '',
  };

  // Campos específicos por categoría
  switch (category) {
    case AuctionCategoriesConst.BAGS: {
      return {
        ...base,
        material: article.material ?? '',
        brand: article.brand ?? '',
        color: article.color ?? '',
        smell: article.smell ?? '',
        length: article.length ? String(article.length) : '',
        width: article.width ? String(article.width) : '',
        height: article.height ? String(article.height) : '',
      } as ArticleFormValues<C>;
    }
    case AuctionCategoriesConst.JEWERLY: {
      return {
        ...base,
        material: article.material ?? '',
        brand: article.brand ?? '',
        size: article.size ? String(article.size) : '',
        color: article.color ?? '',
        documentation: !!article.documentation,
      } as ArticleFormValues<C>;
    }
    case AuctionCategoriesConst.WATCHES: {
      return {
        ...base,
        brand: article.brand ?? '',
        faceDiameter: article.faceDiameter ? String(article.faceDiameter) : '',
        movement: article.movement ?? '',
        strapMaterial: article.strapMaterial ?? '',
        boxMaterial: article.boxMaterial ?? '',
        color: article.color ?? '',
        year: article.year ? String(article.year) : '',
        box: !!article.box,
        documentation: !!article.documentation,
      } as ArticleFormValues<C>;
    }
    case AuctionCategoriesConst.ART: {
      return {
        ...base,
        artType: article.artType ?? '',
        weight: article.weight ? String(article.weight) : '',
        length: article.length ? String(article.length) : '',
        width: article.width ? String(article.width) : '',
        height: article.height ? String(article.height) : '',
      } as ArticleFormValues<C>;
    }
    default:
      return base as ArticleFormValues<C>;
  }
}
