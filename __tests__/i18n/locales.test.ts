import {
  DEFAULT_LANG,
  LANGUAGE_OPTIONS,
  LOCALE_CONFIG,
  SUPPORTED_LANGUAGES,
  isLang,
  resolveLang,
} from '@/i18n/locales';

describe('app locale registry', () => {
  it('derives supported languages from the registry', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(Object.keys(LOCALE_CONFIG));
    expect(SUPPORTED_LANGUAGES).toEqual(['es', 'en']);
    expect(DEFAULT_LANG).toBe('es');
  });

  it('derives language options from the registry', () => {
    expect(LANGUAGE_OPTIONS).toEqual([
      { value: 'es', label: 'Español' },
      { value: 'en', label: 'English' },
    ]);
  });

  it('keeps the existing platform locale conventions', () => {
    expect(LOCALE_CONFIG.es.intlLocale).toBe('es-ES');
    expect(LOCALE_CONFIG.en.intlLocale).toBe('en-US');
    expect(LOCALE_CONFIG.es.currencyLocale).toBe('es-ES');
    expect(LOCALE_CONFIG.en.currencyLocale).toBe('en-IE');
  });

  it('validates locale values', () => {
    expect(isLang('es')).toBe(true);
    expect(isLang('en')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it('resolves untrusted locale values to a supported language', () => {
    expect(resolveLang('en')).toBe('en');
    expect(resolveLang('es')).toBe('es');
    expect(resolveLang('it')).toBe(DEFAULT_LANG);
    expect(resolveLang(null)).toBe(DEFAULT_LANG);
  });
});
