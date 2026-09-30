import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

describe.each([
  ['en', en, '%{min}'],
  ['es', es, '%{min}'],
] as const)('%s shared messages', (_locale, dictionary, minPlaceholder) => {
  it('exposes common UI namespaces', () => {
    expect(dictionary.common.actions.retry).toBeDefined();
    expect(dictionary.common.status.loading).toBeDefined();
    expect(dictionary.common.toast.error).toBeDefined();
    expect(dictionary.errors.unexpected).toBeDefined();
    expect(dictionary.errorBoundary.description).toBeDefined();
    expect(dictionary.notFound.description).toBeDefined();
    expect(dictionary.validation.minLength).toContain(minPlaceholder);
  });
});
