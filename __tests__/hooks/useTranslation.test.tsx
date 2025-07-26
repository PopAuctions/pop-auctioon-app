import { renderHook, act } from '@testing-library/react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { getCurrentLocale, changeLocale } from '@/i18n';
import esTranslations from '@/i18n/locales/es.json';
import enTranslations from '@/i18n/locales/en.json';

// Variable para controlar el mock de i18n
let mockI18nLocale = 'es';

// Mock de los módulos de i18n
jest.mock('@/i18n', () => {
  const mockI18n = {
    t: jest.fn((key: string) => {
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
    }),
    locale: 'es', // Valor por defecto
  };

  return {
    __esModule: true,
    default: mockI18n,
    getCurrentLocale: jest.fn(() => mockI18nLocale),
    changeLocale: jest.fn((newLocale: string) => {
      mockI18nLocale = newLocale;
    }),
    getAvailableLocales: jest.fn(() => ['es', 'en']),
  };
});

describe('useTranslation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetear al español por defecto
    mockI18nLocale = 'es';
  });

  describe('Initial State', () => {
    it('should initialize with Spanish as default locale', () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.locale).toBe('es');
      expect(getCurrentLocale).toHaveBeenCalled();
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

      const nonExistentKey = result.current.t('nonexistent.key');

      expect(nonExistentKey).toBe('nonexistent.key');
    });

    it('should handle empty or invalid keys gracefully', () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.t('')).toBe('');
      expect(result.current.t('.')).toBe('.');
      expect(result.current.t('...')).toBe('...');
    });
  });

  describe('Language Change', () => {
    it('should change language to English', () => {
      const { result } = renderHook(() => useTranslation());

      act(() => {
        result.current.changeLanguage('en');
      });

      expect(changeLocale).toHaveBeenCalledWith('en');
      expect(result.current.locale).toBe('en');
    });

    it('should change language to Spanish', () => {
      const { result } = renderHook(() => useTranslation());

      // Cambiar a inglés primero
      act(() => {
        result.current.changeLanguage('en');
      });

      // Luego cambiar de vuelta a español
      act(() => {
        result.current.changeLanguage('es');
      });

      expect(changeLocale).toHaveBeenCalledWith('es');
      expect(result.current.locale).toBe('es');
    });

    it('should translate correctly after language change', () => {
      const { result } = renderHook(() => useTranslation());

      // Verificar traducción en español
      let errorTitle = result.current.t('errorLoading.title');
      expect(errorTitle).toBe(esTranslations.errorLoading.title);

      // Cambiar a inglés
      act(() => {
        result.current.changeLanguage('en');
      });

      // Verificar traducción en inglés
      errorTitle = result.current.t('errorLoading.title');
      expect(errorTitle).toBe(enTranslations.errorLoading.title);
    });
  });

  describe('Integration with i18n', () => {
    it('should call getCurrentLocale on initialization', () => {
      renderHook(() => useTranslation());

      expect(getCurrentLocale).toHaveBeenCalled();
    });

    it('should call changeLocale when changing language', () => {
      const { result } = renderHook(() => useTranslation());

      act(() => {
        result.current.changeLanguage('en');
      });

      expect(changeLocale).toHaveBeenCalledWith('en');
    });
  });

  describe('Translation Consistency', () => {
    it('should have consistent translation structure between languages', () => {
      // Verificar que ambos idiomas tengan las mismas claves
      expect(esTranslations.errorLoading).toBeDefined();
      expect(enTranslations.errorLoading).toBeDefined();

      expect(esTranslations.errorLoading.title).toBeDefined();
      expect(enTranslations.errorLoading.title).toBeDefined();

      expect(esTranslations.errorLoading.fontError).toBeDefined();
      expect(enTranslations.errorLoading.fontError).toBeDefined();
    });

    it('should have different content for different languages', () => {
      // Verificar que las traducciones sean diferentes
      expect(esTranslations.errorLoading.fontError).not.toBe(
        enTranslations.errorLoading.fontError
      );
      expect(esTranslations.loginPage.login).not.toBe(
        enTranslations.loginPage.login
      );
    });
  });
});
