import { renderHook } from '@testing-library/react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import esTranslations from '@/i18n/locales/es.json';
import enTranslations from '@/i18n/locales/en.json';

// Variable para controlar el mock de i18n
let mockI18nLocale = 'es';

// Mock de los módulos de i18n
jest.mock('@/i18n', () => {
  const mockTranslate = jest.fn((key: string) => {
    // Importar traducciones reales dentro del mock
    const mockEsTranslations = require('@/i18n/locales/es.json');
    const mockEnTranslations = require('@/i18n/locales/en.json');

    // Simular el comportamiento del i18n con locale actual
    const translations =
      mockI18nLocale === 'en' ? mockEnTranslations : mockEsTranslations;

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value[k];
      if (value === undefined) break;
    }

    return value || key;
  });

  const mockI18n = {
    t: mockTranslate,
    locale: 'es', // Valor por defecto
  };

  return {
    __esModule: true,
    default: mockI18n,
    t: mockTranslate, // Exportar t directamente
    getCurrentLocale: jest.fn(() => mockI18nLocale),
    changeLocale: jest.fn((newLocale: string) => {
      mockI18nLocale = newLocale;
    }),
    getAvailableLocales: jest.fn(() => ['es', 'en']),
  };
});

// Mock del contexto de traducción - simula el comportamiento real
jest.mock('@/context/translation-context', () => {
  return {
    useTranslationContext: jest.fn(() => ({
      locale: mockI18nLocale,
      changeLanguage: (newLocale: string) => {
        mockI18nLocale = newLocale;
      },
      isPending: false,
    })),
  };
});

describe('useTranslation Hook', () => {
  beforeEach(() => {
    // Resetear al español por defecto
    mockI18nLocale = 'es';
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with Spanish as default locale', () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.locale).toBe('es');
    });

    it('should provide translation function', () => {
      const { result } = renderHook(() => useTranslation());

      expect(typeof result.current.t).toBe('function');
      expect(typeof result.current.changeLanguage).toBe('function');
    });
  });

  describe('Translation Function (t)', () => {
    it('should translate keys correctly in Spanish', () => {
      const { result } = renderHook(() => useTranslation());

      const errorTitle = result.current.t('errorLoading.title');
      const errorMessage = result.current.t('errorLoading.fontError');

      expect(errorTitle).toBe(esTranslations.errorLoading.title);
      expect(errorMessage).toBe(esTranslations.errorLoading.fontError);
    });

    it('should handle nested translation keys', () => {
      const { result } = renderHook(() => useTranslation());

      const loginText = result.current.t('loginPage.login');
      const commonError = result.current.t('commonActions.error');

      expect(loginText).toBe(esTranslations.loginPage.login);
      expect(commonError).toBe(esTranslations.commonActions.error);
    });

    it('should return the key if translation is not found', () => {
      const { result } = renderHook(() => useTranslation());

      const nonExistentKey = result.current.t('nonexistent.key' as any);

      expect(nonExistentKey).toBe('nonexistent.key');
    });

    it('should handle empty or invalid keys gracefully', () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.t('' as any)).toBe('');
      expect(result.current.t('.' as any)).toBe('.');
      expect(result.current.t('...' as any)).toBe('...');
    });
  });

  describe('Language Change', () => {
    it('should have changeLanguage function', () => {
      const { result } = renderHook(() => useTranslation());

      expect(typeof result.current.changeLanguage).toBe('function');
    });

    it('should have isPending state', () => {
      const { result } = renderHook(() => useTranslation());

      expect(typeof result.current.isPending).toBe('boolean');
      expect(result.current.isPending).toBe(false);
    });

    it('should translate using current locale', () => {
      mockI18nLocale = 'en';
      const { result } = renderHook(() => useTranslation());

      const errorTitle = result.current.t('errorLoading.title');
      expect(errorTitle).toBe(enTranslations.errorLoading.title);
    });
  });

  describe('Translation Consistency', () => {
    it('should have the required translation keys in both languages', () => {
      expect(Object.keys(esTranslations.errorLoading).sort()).toEqual(
        Object.keys(enTranslations.errorLoading).sort()
      );
      expect(typeof esTranslations.errorLoading.title).toBe('string');
      expect(typeof enTranslations.errorLoading.title).toBe('string');
      expect(typeof esTranslations.errorLoading.fontError).toBe('string');
      expect(typeof enTranslations.errorLoading.fontError).toBe('string');
    });
  });
});
