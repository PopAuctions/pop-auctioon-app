import { AuctionStatus } from '@/constants/auctions';
import { CALENDAR_MONTH_VALUES } from '@/constants/months';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';
import { AuctionCategoriesConst, AuctionMode } from '@/types/types';

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
] as const)(
  '%s centralized auction and calendar labels',
  (_locale, dictionary) => {
    it('covers every canonical value with a non-empty label', () => {
      expectLabelRecord(
        dictionary.displayLabels.auctionMode,
        Object.values(AuctionMode)
      );
      expectLabelRecord(
        dictionary.displayLabels.auctionStatus,
        Object.values(AuctionStatus)
      );
      expectLabelRecord(
        dictionary.displayLabels.auctionCategory,
        Object.values(AuctionCategoriesConst)
      );
      expectLabelRecord(
        dictionary.displayLabels.calendarMonth,
        Object.keys(CALENDAR_MONTH_VALUES)
      );
    });
  }
);
