import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveLanguagePreference,
  loadLanguagePreference,
  changeLocale,
  getCurrentLocale,
  getAvailableLocales,
} from '@/i18n';
import { LANGUAGE_STORAGE_KEY } from '@/constants/locales';
import { Lang } from '@/types/types';

describe('Language Persistence - i18n utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('saveLanguagePreference', () => {
    it('should save Spanish preference to AsyncStorage', async () => {
      await saveLanguagePreference('es');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        LANGUAGE_STORAGE_KEY,
        'es'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should save English preference to AsyncStorage', async () => {
      await saveLanguagePreference('en');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        LANGUAGE_STORAGE_KEY,
        'en'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('AsyncStorage error');

      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error);

      await saveLanguagePreference('es');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error saving language preference:',
        error
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not throw error on failure', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage full')
      );

      await expect(saveLanguagePreference('en')).resolves.toBeUndefined();
    });
  });

  describe('loadLanguagePreference', () => {
    it('should return Spanish when saved in AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('es');

      const result = await loadLanguagePreference();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
      expect(result).toBe('es');
    });

    it('should return English when saved in AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('en');

      const result = await loadLanguagePreference();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
      expect(result).toBe('en');
    });

    it('should return null when no language is saved', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await loadLanguagePreference();

      expect(result).toBeNull();
    });

    it('should return null for invalid language codes', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('fr');

      const result = await loadLanguagePreference();

      expect(result).toBeNull();
    });

    it('should return null for empty string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('');

      const result = await loadLanguagePreference();

      expect(result).toBeNull();
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('AsyncStorage read error');

      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error);

      const result = await loadLanguagePreference();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading language preference:',
        error
      );
      expect(result).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should not throw error on failure', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Read error')
      );

      await expect(loadLanguagePreference()).resolves.toBeNull();
    });
  });

  describe('changeLocale', () => {
    it('should change locale to Spanish', () => {
      changeLocale('es');
      expect(getCurrentLocale()).toBe('es');
    });

    it('should change locale to English', () => {
      changeLocale('en');
      expect(getCurrentLocale()).toBe('en');
    });

    it('should persist locale changes', () => {
      changeLocale('en');
      expect(getCurrentLocale()).toBe('en');

      changeLocale('es');
      expect(getCurrentLocale()).toBe('es');

      changeLocale('en');
      expect(getCurrentLocale()).toBe('en');
    });
  });

  describe('getCurrentLocale', () => {
    it('should return a valid Lang type', () => {
      const locale = getCurrentLocale();
      expect(['es', 'en']).toContain(locale);
    });

    it('should reflect the current locale', () => {
      changeLocale('en');
      expect(getCurrentLocale()).toBe('en');

      changeLocale('es');
      expect(getCurrentLocale()).toBe('es');
    });
  });

  describe('getAvailableLocales', () => {
    it('should return array of available locales', () => {
      const locales = getAvailableLocales();

      expect(Array.isArray(locales)).toBe(true);
      expect(locales).toHaveLength(2);
    });

    it('should include Spanish and English', () => {
      const locales = getAvailableLocales();

      expect(locales).toContain('es');
      expect(locales).toContain('en');
    });

    it('should return only supported languages', () => {
      const locales = getAvailableLocales();

      locales.forEach((locale) => {
        expect(['es', 'en']).toContain(locale);
      });
    });
  });

  describe('Integration - Save and Load', () => {
    it('should save and load Spanish preference', async () => {
      const mockStorage = new Map<string, string>();

      (AsyncStorage.setItem as jest.Mock).mockImplementation(
        async (key, value) => {
          mockStorage.set(key, value);
        }
      );

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key) => {
        return mockStorage.get(key) ?? null;
      });

      await saveLanguagePreference('es');
      const loaded = await loadLanguagePreference();

      expect(loaded).toBe('es');
    });

    it('should save and load English preference', async () => {
      const mockStorage = new Map<string, string>();

      (AsyncStorage.setItem as jest.Mock).mockImplementation(
        async (key, value) => {
          mockStorage.set(key, value);
        }
      );

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key) => {
        return mockStorage.get(key) ?? null;
      });

      await saveLanguagePreference('en');
      const loaded = await loadLanguagePreference();

      expect(loaded).toBe('en');
    });

    it('should overwrite previous preference', async () => {
      const mockStorage = new Map<string, string>();

      (AsyncStorage.setItem as jest.Mock).mockImplementation(
        async (key, value) => {
          mockStorage.set(key, value);
        }
      );

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key) => {
        return mockStorage.get(key) ?? null;
      });

      await saveLanguagePreference('es');
      let loaded = await loadLanguagePreference();
      expect(loaded).toBe('es');

      await saveLanguagePreference('en');
      loaded = await loadLanguagePreference();
      expect(loaded).toBe('en');
    });
  });

  describe('Type Safety', () => {
    it('should only accept valid Lang types for saveLanguagePreference', async () => {
      // TypeScript should prevent invalid values
      const validLanguages: Lang[] = ['es', 'en'];

      for (const lang of validLanguages) {
        await expect(saveLanguagePreference(lang)).resolves.toBeUndefined();
      }
    });

    it('should return Lang or null from loadLanguagePreference', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('es');

      const result = await loadLanguagePreference();

      if (result !== null) {
        const validLanguages: Lang[] = ['es', 'en'];
        expect(validLanguages).toContain(result);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent save operations', async () => {
      const promises = [
        saveLanguagePreference('es'),
        saveLanguagePreference('en'),
        saveLanguagePreference('es'),
      ];

      await expect(Promise.all(promises)).resolves.toBeDefined();
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent load operations', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('es');

      const promises = [
        loadLanguagePreference(),
        loadLanguagePreference(),
        loadLanguagePreference(),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual(['es', 'es', 'es']);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(3);
    });

    it('should use correct AsyncStorage key constant', async () => {
      await saveLanguagePreference('es');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        LANGUAGE_STORAGE_KEY,
        'es'
      );
      expect(LANGUAGE_STORAGE_KEY).toBe('@app_language');
    });
  });
});
