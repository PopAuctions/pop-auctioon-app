import { renderHook, waitFor } from '@testing-library/react-native';
import { useFetchPaymentConfig } from '@/hooks/components/useFetchPaymentConfig';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { CountryValue } from '@/types/types';

jest.mock(
  '@/utils/supabase/supabase-store',
  () => require('@/__tests__/setup/mocks.mock').mockSupabase
);
jest.mock('@/hooks/api/useSecureApi');
jest.mock('@/lib/error/sentry-error-report');

const mockSecureGet = jest.fn();
const mockUseSecureApi = useSecureApi as jest.MockedFunction<
  typeof useSecureApi
>;

describe('useFetchPaymentConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSecureApi.mockReturnValue({
      secureGet: mockSecureGet,
      securePost: jest.fn(),
      protectedGet: jest.fn(),
      protectedPost: jest.fn(),
    });
  });

  const mockBackendResponse = {
    taxPercentageArticles: 21,
    taxForShipping: {
      SPAIN: 10,
      FRANCE: 15,
      GERMANY: 20,
      GENERAL: 29,
    },
    commissionsValue: {
      STANDARD: {
        PERCENTAGE: 12.5,
        THRESHOLD: null,
        LABEL: 'Standard Commission',
      },
    },
    countries: {
      es: [
        { label: 'España', value: 'SPAIN' as CountryValue },
        { label: 'Francia', value: 'FRANCE' as CountryValue },
      ],
      en: [
        { label: 'Spain', value: 'SPAIN' as CountryValue },
        { label: 'France', value: 'FRANCE' as CountryValue },
      ],
    },
    countriesLabel: {
      es: {
        SPAIN: 'España',
        FRANCE: 'Francia',
      },
      en: {
        SPAIN: 'Spain',
        FRANCE: 'France',
      },
    },
  };

  const expectedTransformedData = {
    commission: 12.5,
    shippingTaxes: {
      SPAIN: 10,
      FRANCE: 15,
      GERMANY: 20,
      GENERAL: 29,
    },
    taxPercentage: 21,
    countries: {
      es: ['SPAIN', 'FRANCE'],
      en: ['SPAIN', 'FRANCE'],
    },
    countriesLabel: {
      es: {
        SPAIN: 'España',
        FRANCE: 'Francia',
      },
      en: {
        SPAIN: 'Spain',
        FRANCE: 'France',
      },
    },
  };

  it('should start with loading status', () => {
    mockSecureGet.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useFetchPaymentConfig());

    expect(result.current.status).toBe('loading');
    expect(result.current.data).toEqual({
      commission: 0,
      shippingTaxes: {},
      taxPercentage: 0,
      countries: {},
      countriesLabel: {},
    });
    expect(result.current.errorMessage).toBeNull();
  });

  it('should fetch and transform payment config successfully', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: mockBackendResponse,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual(expectedTransformedData);
    expect(result.current.errorMessage).toBeNull();

    expect(mockSecureGet).toHaveBeenCalledWith({
      endpoint: SECURE_ENDPOINTS.PAYMENT.INFO,
    });
  });

  it('should transform countries from objects to value arrays', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: mockBackendResponse,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Check that transformation worked correctly
    expect(result.current.data.countries.es).toEqual(['SPAIN', 'FRANCE']);
    expect(result.current.data.countries.en).toEqual(['SPAIN', 'FRANCE']);

    // Ensure it's not the original object format
    expect(result.current.data.countries.es).not.toContainEqual({
      label: expect.any(String),
      value: expect.any(String),
    });
  });

  it('should extract commission percentage from STANDARD tier', async () => {
    const customResponse = {
      ...mockBackendResponse,
      commissionsValue: {
        STANDARD: {
          PERCENTAGE: 15.75,
          THRESHOLD: 1000,
          LABEL: 'Standard',
        },
      },
    };

    mockSecureGet.mockResolvedValueOnce({
      data: customResponse,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data.commission).toBe(15.75);
  });

  it('should handle API error response', async () => {
    const mockError = {
      es: 'Error del servidor',
      en: 'Server error',
    };

    mockSecureGet.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual(mockError);
    expect(result.current.data).toEqual({
      commission: 0,
      shippingTaxes: {},
      taxPercentage: 0,
      countries: {},
      countriesLabel: {},
    });
  });

  it('should handle missing data in response', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Payment configuration data is missing',
      es: 'Faltan los datos de configuración de pago',
    });
  });

  it('should handle undefined data in response', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: undefined,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Payment configuration data is missing',
      es: 'Faltan los datos de configuración de pago',
    });
  });

  it('should handle network/unexpected errors', async () => {
    mockSecureGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.errorMessage).toEqual({
      en: 'Error fetching payment configuration data',
      es: 'Error al cargar la configuración de pago',
    });
  });

  it('should handle empty countries object', async () => {
    const responseWithEmptyCountries = {
      ...mockBackendResponse,
      countries: {},
      countriesLabel: {},
    };

    mockSecureGet.mockResolvedValueOnce({
      data: responseWithEmptyCountries,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data.countries).toEqual({});
    expect(result.current.data.countriesLabel).toEqual({});
  });

  it('should handle multiple locales in countries', async () => {
    const responseWithMultipleLocales = {
      ...mockBackendResponse,
      countries: {
        es: [{ label: 'España', value: 'SPAIN' as CountryValue }],
        en: [{ label: 'Spain', value: 'SPAIN' as CountryValue }],
        fr: [{ label: 'Espagne', value: 'SPAIN' as CountryValue }],
      },
      countriesLabel: {
        es: { SPAIN: 'España' },
        en: { SPAIN: 'Spain' },
        fr: { SPAIN: 'Espagne' },
      },
    };

    mockSecureGet.mockResolvedValueOnce({
      data: responseWithMultipleLocales,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data.countries).toEqual({
      es: ['SPAIN'],
      en: ['SPAIN'],
      fr: ['SPAIN'],
    });
  });

  it('should preserve all shipping tax countries', async () => {
    const customShippingTaxes = {
      SPAIN: 10,
      FRANCE: 15,
      GERMANY: 20,
      ITALY: 18,
      PORTUGAL: 12,
      GENERAL: 29,
    };

    const responseWithManyCountries = {
      ...mockBackendResponse,
      taxForShipping: customShippingTaxes,
    };

    mockSecureGet.mockResolvedValueOnce({
      data: responseWithManyCountries,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data.shippingTaxes).toEqual(customShippingTaxes);
  });

  it('should handle zero commission percentage', async () => {
    const responseWithZeroCommission = {
      ...mockBackendResponse,
      commissionsValue: {
        STANDARD: {
          PERCENTAGE: 0,
          THRESHOLD: null,
          LABEL: 'No Commission',
        },
      },
    };

    mockSecureGet.mockResolvedValueOnce({
      data: responseWithZeroCommission,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data.commission).toBe(0);
  });

  it('should auto-fetch on mount', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: mockBackendResponse,
      error: null,
    });

    renderHook(() => useFetchPaymentConfig());

    await waitFor(() => {
      expect(mockSecureGet).toHaveBeenCalledTimes(1);
    });
  });

  it('should provide setErrorMessage function', () => {
    mockSecureGet.mockResolvedValueOnce({
      data: mockBackendResponse,
      error: null,
    });

    const { result } = renderHook(() => useFetchPaymentConfig());

    expect(result.current.setErrorMessage).toBeInstanceOf(Function);
  });
});
