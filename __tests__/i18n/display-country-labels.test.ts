import { COUNTRIES_ARRAY } from '@/constants/payment';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

describe.each([
  ['en', en],
  ['es', es],
] as const)('%s centralized country labels', (_locale, dictionary) => {
  it('contains a non-empty label for every canonical country', () => {
    const labels = dictionary.displayLabels.country;

    expect(Object.keys(labels).sort()).toEqual([...COUNTRIES_ARRAY].sort());

    for (const country of COUNTRIES_ARRAY) {
      expect(typeof labels[country]).toBe('string');
      expect(labels[country].length).toBeGreaterThan(0);
    }
  });
});
