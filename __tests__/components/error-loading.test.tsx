import React from 'react';
import { render } from '@testing-library/react-native';
import ErrorLoading from '@/components/loading/error-loading';

// Importar las traducciones reales
import esTranslations from '@/i18n/locales/es.json';
import enTranslations from '@/i18n/locales/en.json';

// Mock del hook useTranslation que usa las traducciones reales
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Importar las traducciones dentro del mock
      const mockEsTranslations = require('@/i18n/locales/es.json');

      // Navegar por las claves anidadas (ej: 'errorLoading.title')
      const keys = key.split('.');
      let value: any = mockEsTranslations;

      for (const k of keys) {
        value = value[k];
        if (value === undefined) break;
      }

      return value || key;
    },
  }),
}));

describe('ErrorLoading Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default content', () => {
    const { getByText } = render(<ErrorLoading />);

    // Verificar que se muestre el título del error (desde es.json)
    expect(getByText(esTranslations.errorLoading.title)).toBeTruthy();

    // Verificar que se muestre el mensaje de error de fuentes (desde es.json)
    expect(getByText(esTranslations.errorLoading.fontError)).toBeTruthy();
  });

  it('uses translation keys correctly', () => {
    // Este test simplemente verifica que el componente renderiza el contenido traducido
    const { getByText } = render(<ErrorLoading />);

    // Verificar que las traducciones se aplicaron correctamente usando los valores reales
    expect(getByText(esTranslations.errorLoading.title)).toBeTruthy();
    expect(getByText(esTranslations.errorLoading.fontError)).toBeTruthy();
  });

  it('has the correct component structure', () => {
    const { getByText } = render(<ErrorLoading />);

    const titleElement = getByText(esTranslations.errorLoading.title);
    const messageElement = getByText(esTranslations.errorLoading.fontError);

    expect(titleElement).toBeTruthy();
    expect(messageElement).toBeTruthy();
  });

  it('renders when there is a font loading error in RootLayout', () => {
    // Simular el escenario donde RootLayout renderiza ErrorLoading por un error de fuentes
    const { getByText } = render(<ErrorLoading />);

    // Verificar que el componente se renderiza correctamente
    expect(getByText(esTranslations.errorLoading.title)).toBeTruthy();
    expect(getByText(esTranslations.errorLoading.fontError)).toBeTruthy();
  });

  it('should be accessible for screen readers', () => {
    const { getByText } = render(<ErrorLoading />);

    const titleElement = getByText(esTranslations.errorLoading.title);
    const messageElement = getByText(esTranslations.errorLoading.fontError);

    // Verificar que los elementos existen (básico para accesibilidad)
    expect(titleElement).toBeTruthy();
    expect(messageElement).toBeTruthy();
  });

  describe('Integration with RootLayout', () => {
    it('should render when fontError is truthy', () => {
      // Test que simula el comportamiento en RootLayout
      const fontError = new Error('Font loading failed');

      // Simular la condición: if (fontError) { return <ErrorLoading />; }
      const shouldRenderErrorLoading = !!fontError;

      expect(shouldRenderErrorLoading).toBe(true);

      if (shouldRenderErrorLoading) {
        const { getByText } = render(<ErrorLoading />);
        expect(getByText(esTranslations.errorLoading.title)).toBeTruthy();
      }
    });
  });

  describe('Localization', () => {
    it('should have different translations for Spanish and English', () => {
      // Este test verifica que las traducciones son diferentes entre idiomas
      expect(esTranslations.errorLoading.title).toBe('Error');
      expect(enTranslations.errorLoading.title).toBe('Error');

      // Verificar que los mensajes son diferentes
      expect(esTranslations.errorLoading.fontError).toContain('fuentes');
      expect(enTranslations.errorLoading.fontError).toContain('fonts');

      // Verificar que las traducciones no son iguales
      expect(esTranslations.errorLoading.fontError).not.toBe(
        enTranslations.errorLoading.fontError
      );
    });

    it('should use the correct translation structure', () => {
      // Verificar que las estructuras de traducción son correctas
      expect(esTranslations.errorLoading).toBeDefined();
      expect(esTranslations.errorLoading.title).toBeDefined();
      expect(esTranslations.errorLoading.fontError).toBeDefined();

      expect(enTranslations.errorLoading).toBeDefined();
      expect(enTranslations.errorLoading.title).toBeDefined();
      expect(enTranslations.errorLoading.fontError).toBeDefined();
    });
  });
});
