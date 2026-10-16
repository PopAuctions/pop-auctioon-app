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
    expect(DEFAULT_LANG).toBe('es');
  });

  it('derives language options from the registry', () => {
    expect(LANGUAGE_OPTIONS).toEqual(
      SUPPORTED_LANGUAGES.map((value) => ({
        value,
        label: LOCALE_CONFIG[value].label,
      }))
    );
  });

  it('keeps the existing platform locale conventions', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const config = LOCALE_CONFIG[lang];

      expect(Object.keys(config).sort()).toEqual([
        'currencyLocale',
        'flag',
        'intlLocale',
        'label',
        'shortLabel',
      ]);
      expect(Intl.DateTimeFormat.supportedLocalesOf(config.intlLocale)).toEqual(
        [config.intlLocale]
      );
      expect(
        Intl.NumberFormat.supportedLocalesOf(config.currencyLocale)
      ).toEqual([config.currencyLocale]);
    }
  });

  it.each(SUPPORTED_LANGUAGES)('validates the registered %s locale', (lang) => {
    expect(isLang(lang)).toBe(true);
  });

  it('rejects unsupported locale values', () => {
    expect(isLang('fr')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it.each(SUPPORTED_LANGUAGES)('resolves the registered %s locale', (lang) => {
    expect(resolveLang(lang)).toBe(lang);
  });

  it('resolves unsupported locale values to the default', () => {
    expect(resolveLang('it')).toBe(DEFAULT_LANG);
    expect(resolveLang(null)).toBe(DEFAULT_LANG);
  });
});
