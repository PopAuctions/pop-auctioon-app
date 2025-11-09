import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticleSpecificationsSection } from '@/components/articles/ArticleSpecificationsSection';

describe('ArticleSpecificationsSection', () => {
  const mockArticle = {
    id: 1,
    title: 'Test Article',
    brand: 'Test Brand',
    category: 'BAG' as const,
    width: 10,
    height: 20,
    length: 30,
    state: 'GOOD_CONDITION' as const,
    startingPrice: 100,
    status: 'PUBLISHED' as const,
    documentation: false,
    sold: false,
    codeNumber: 'ABC123',
    box: null,
    boxMaterial: null,
    color: null,
    description: null,
    estimatedValue: null,
    faceDiameter: null,
    images: null,
    material: null,
    movement: null,
    observations: null,
    ownerId: null,
    reservePrice: null,
    size: null,
    smell: null,
    soldPrice: null,
    strapMaterial: null,
    weight: null,
    year: null,
    articleBidId: null,
    artType: null,
    auctionId: null,
    ArticleBid: {
      currentValue: 100,
      available: true,
      highestBidderUsername: null,
      highestBidderImage: null,
    },
  };

  const mockArticleLang = {
    model: 'Model',
    brand: 'Brand',
    material: 'Material',
    condition: 'Condition',
    artType: 'Type',
    weight: 'Weight',
    measures: 'Measures',
    faceDiameter: 'Face Diameter',
    movement: 'Movement',
    strapMaterial: 'Strap Material',
    boxMaterial: 'Box Material',
    year: 'Year',
    color: 'Color',
    size: 'Size',
    smell: 'Smell',
    documentation: 'Documentation',
    box: 'Box',
    codeNumber: 'Code',
    yes: 'Yes',
    no: 'No',
  };

  it('renders article specifications with model and brand', () => {
    const { getByText } = render(
      <ArticleSpecificationsSection
        article={mockArticle}
        articleLang={mockArticleLang as any}
        lang='en'
        articleCategory='BAG'
      />
    );
    expect(getByText('Test Article')).toBeTruthy();
    expect(getByText('Test Brand')).toBeTruthy();
  });

  it('renders measures when provided', () => {
    const { getByText } = render(
      <ArticleSpecificationsSection
        article={mockArticle}
        articleLang={mockArticleLang as any}
        lang='en'
        articleCategory='BAG'
      />
    );
    // Measures formatted as "10x20x30cm" (no spaces)
    expect(getByText('10x20x30cm')).toBeTruthy();
  });
});
