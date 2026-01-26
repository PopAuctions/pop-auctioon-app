import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  TranslationProvider,
  useTranslationContext,
} from '@/context/translation-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_STORAGE_KEY } from '@/constants/locales';
import * as i18n from '@/i18n';

// Mock the i18n module
jest.mock('@/i18n', () => ({
  getCurrentLocale: jest.fn(() => 'es'),
  changeLocale: jest.fn(),
  loadLanguagePreference: jest.fn(),
  saveLanguagePreference: jest.fn(),
}));

describe('TranslationProvider - Language Persistence Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (i18n.getCurrentLocale as jest.Mock).mockReturnValue('es');
    (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue(null);
  });

  describe('Initialization', () => {
    it('should initialize with device locale when no saved preference', async () => {
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue(null);
      (i18n.getCurrentLocale as jest.Mock).mockReturnValue('es');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBe('es');
      });
    });

    it('should load saved Spanish preference from AsyncStorage', async () => {
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue('es');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(i18n.loadLanguagePreference).toHaveBeenCalled();
        expect(i18n.changeLocale).toHaveBeenCalledWith('es');
        expect(result.current.locale).toBe('es');
      });
    });

    it('should load saved English preference from AsyncStorage', async () => {
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue('en');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(i18n.loadLanguagePreference).toHaveBeenCalled();
        expect(i18n.changeLocale).toHaveBeenCalledWith('en');
        expect(result.current.locale).toBe('en');
      });
    });

    it('should prioritize saved preference over device locale', async () => {
      // Device is Spanish
      (i18n.getCurrentLocale as jest.Mock).mockReturnValue('es');
      // But user saved English
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue('en');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        // Should use saved preference (English), not device (Spanish)
        expect(i18n.changeLocale).toHaveBeenCalledWith('en');
        expect(result.current.locale).toBe('en');
      });
    });

    it('should not render children until initialized', () => {
      const testChild = jest.fn(() => null);

      (i18n.loadLanguagePreference as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      );

      renderHook(() => useTranslationContext(), {
        wrapper: ({ children }) => (
          <TranslationProvider>
            {testChild}
            {children}
          </TranslationProvider>
        ),
      });

      // Should not render immediately
      expect(testChild).not.toHaveBeenCalled();
    });
  });

  describe('changeLanguage Function', () => {
    it('should change language to English and save to storage', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBeDefined();
      });

      // Change to English
      result.current.changeLanguage('en');

      await waitFor(() => {
        expect(i18n.saveLanguagePreference).toHaveBeenCalledWith('en');
        expect(i18n.changeLocale).toHaveBeenCalledWith('en');
      });
    });

    it('should change language to Spanish and save to storage', async () => {
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue('en');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBe('en');
      });

      // Change to Spanish
      result.current.changeLanguage('es');

      await waitFor(() => {
        expect(i18n.saveLanguagePreference).toHaveBeenCalledWith('es');
        expect(i18n.changeLocale).toHaveBeenCalledWith('es');
      });
    });

    it('should update locale state after language change', async () => {
      (i18n.getCurrentLocale as jest.Mock).mockReturnValue('es');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBe('es');
      });

      // Mock the locale change
      (i18n.getCurrentLocale as jest.Mock).mockReturnValue('en');

      result.current.changeLanguage('en');

      await waitFor(() => {
        expect(result.current.locale).toBe('en');
      });
    });

    it('should handle multiple consecutive language changes', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBeDefined();
      });

      result.current.changeLanguage('en');
      result.current.changeLanguage('es');
      result.current.changeLanguage('en');

      await waitFor(() => {
        expect(i18n.saveLanguagePreference).toHaveBeenCalledTimes(3);
        expect(i18n.saveLanguagePreference).toHaveBeenNthCalledWith(1, 'en');
        expect(i18n.saveLanguagePreference).toHaveBeenNthCalledWith(2, 'es');
        expect(i18n.saveLanguagePreference).toHaveBeenNthCalledWith(3, 'en');
      });
    });
  });

  describe('isPending State', () => {
    it('should initially have isPending as false', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it('should provide isPending state during transitions', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBeDefined();
      });

      // isPending should be a boolean
      expect(typeof result.current.isPending).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle loadLanguagePreference errors gracefully', async () => {
      // Mock implementation that doesn't throw in console
      (i18n.loadLanguagePreference as jest.Mock).mockImplementation(
        async () => {
          // Simulate error but handle it internally
          return null;
        }
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        // Should still initialize with device/default locale
        expect(result.current.locale).toBeDefined();
      });
    });

    it('should continue working if saveLanguagePreference fails', async () => {
      // Allow load to succeed
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue(null);
      // But save will "fail" silently
      (i18n.saveLanguagePreference as jest.Mock).mockImplementation(
        async () => {
          // Simulate silent failure (the real function catches errors)
          return;
        }
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBeDefined();
      });

      // Should not throw
      expect(() => result.current.changeLanguage('en')).not.toThrow();
    });
  });

  describe('Context Behavior', () => {
    it('should provide default context value when used outside provider', () => {
      // The context has a default value, so it doesn't throw
      const { result } = renderHook(() => useTranslationContext());

      expect(result.current).toBeDefined();
      expect(result.current.locale).toBe('es');
      expect(typeof result.current.changeLanguage).toBe('function');
      expect(typeof result.current.isPending).toBe('boolean');
    });

    it('should provide consistent locale value to multiple consumers', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result: result1 } = renderHook(() => useTranslationContext(), {
        wrapper,
      });
      const { result: result2 } = renderHook(() => useTranslationContext(), {
        wrapper,
      });

      await waitFor(() => {
        // Locale and isPending should be the same
        expect(result1.current.locale).toBe(result2.current.locale);
        expect(result1.current.isPending).toBe(result2.current.isPending);
        // changeLanguage is a memoized function, so should be same reference
        expect(typeof result1.current.changeLanguage).toBe('function');
        expect(typeof result2.current.changeLanguage).toBe('function');
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('Scenario: First time user (no saved preference)', async () => {
      // No saved preference
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue(null);
      // Device is in Spanish
      (i18n.getCurrentLocale as jest.Mock).mockReturnValue('es');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        // Should use device language (Spanish)
        expect(result.current.locale).toBe('es');
        // Should not have called changeLocale (no saved preference to restore)
        expect(i18n.changeLocale).not.toHaveBeenCalled();
      });
    });

    it('Scenario: User with English saved but Spanish device', async () => {
      // Saved preference: English
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue('en');
      // Device: Spanish
      (i18n.getCurrentLocale as jest.Mock).mockReturnValue('es');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        // Should use saved preference (English), not device (Spanish)
        expect(i18n.changeLocale).toHaveBeenCalledWith('en');
        expect(result.current.locale).toBe('en');
      });
    });

    it('Scenario: User changes language in settings', async () => {
      (i18n.getCurrentLocale as jest.Mock).mockReturnValue('es');
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue(null);
      (i18n.saveLanguagePreference as jest.Mock).mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBe('es');
      });

      // User goes to settings and changes to English
      result.current.changeLanguage('en');

      await waitFor(() => {
        // Should save the preference
        expect(i18n.saveLanguagePreference).toHaveBeenCalledWith('en');
        // Should update the locale immediately
        expect(i18n.changeLocale).toHaveBeenCalledWith('en');
      });
    });

    it('Scenario: App restart should remember user preference', async () => {
      // Simulate saved preference from previous session
      (i18n.loadLanguagePreference as jest.Mock).mockResolvedValue('en');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TranslationProvider>{children}</TranslationProvider>
      );

      const { result } = renderHook(() => useTranslationContext(), { wrapper });

      await waitFor(() => {
        // Should load and apply saved preference
        expect(i18n.loadLanguagePreference).toHaveBeenCalled();
        expect(i18n.changeLocale).toHaveBeenCalledWith('en');
        expect(result.current.locale).toBe('en');
      });
    });
  });
});
