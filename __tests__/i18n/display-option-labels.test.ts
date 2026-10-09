import {
  ALL_STRAP_MATERIAL_VALUES,
  ARTICLE_COLOR_VALUES,
  ARTICLE_MATERIAL_FILTER_VALUES,
  ARTICLE_MATERIAL_VALUES,
  ARTICLE_SMELL_VALUES,
  ARTICLE_STATE_VALUES,
  ART_TYPE_VALUES,
  BOX_MATERIAL_VALUES,
  OFFERS_OPTION_VALUE_ORDER,
  ONLINE_STORE_ARTICLE_STATUS_VALUES,
  PAID_FILTER_VALUE_ORDER,
  WATCH_MOVEMENT_VALUES,
} from '@/constants';
import { SELECTABLE_AUCTION_CATEGORIES } from '@/constants/auctions';
import { SORT_BY_VALUES } from '@/constants/onlineStore';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

function expectLabelRecord(
  labels: Record<string, string>,
  expectedKeys: readonly string[]
) {
  expect(Object.keys(labels).sort()).toEqual([...expectedKeys].sort());

  for (const key of expectedKeys) {
    expect(typeof labels[key]).toBe('string');
    expect(labels[key].length).toBeGreaterThan(0);
  }
}

describe.each([
  ['en', en],
  ['es', es],
] as const)('%s centralized display options', (_locale, dictionary) => {
  it('covers every canonical filter value with a non-empty label', () => {
    expectLabelRecord(dictionary.displayLabels.sortBy, SORT_BY_VALUES);
    expectLabelRecord(
      dictionary.displayLabels.paidFilter,
      PAID_FILTER_VALUE_ORDER
    );
    expectLabelRecord(
      dictionary.displayLabels.onlineStoreArticleStatus,
      ONLINE_STORE_ARTICLE_STATUS_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.offersFilter,
      OFFERS_OPTION_VALUE_ORDER
    );
    expectLabelRecord(
      dictionary.displayLabels.auctionCategorySelection,
      SELECTABLE_AUCTION_CATEGORIES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.state,
      ARTICLE_STATE_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.stateDescription,
      ARTICLE_STATE_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.smell,
      ARTICLE_SMELL_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.movement,
      WATCH_MOVEMENT_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.artType,
      ART_TYPE_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.color,
      ARTICLE_COLOR_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.material,
      ARTICLE_MATERIAL_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.strapMaterial,
      ALL_STRAP_MATERIAL_VALUES
    );
    expectLabelRecord(
      dictionary.displayLabels.articleSpecification.boxMaterial,
      BOX_MATERIAL_VALUES
    );
  });

  it('keeps color and material filter availability and order canonical', () => {
    const colorOptions = ARTICLE_COLOR_VALUES.map((value) => ({
      value,
      label: dictionary.displayLabels.articleSpecification.color[value],
    }));
    const materialOptions = ARTICLE_MATERIAL_FILTER_VALUES.map((value) => ({
      value,
      label: dictionary.displayLabels.articleSpecification.material[value],
    }));

    expect(colorOptions.map(({ value }) => value)).toEqual(
      ARTICLE_COLOR_VALUES
    );
    expect(materialOptions.map(({ value }) => value)).toEqual(
      ARTICLE_MATERIAL_FILTER_VALUES
    );
    expect(colorOptions.every(({ label }) => label.length > 0)).toBe(true);
    expect(materialOptions.every(({ label }) => label.length > 0)).toBe(true);
  });
});
