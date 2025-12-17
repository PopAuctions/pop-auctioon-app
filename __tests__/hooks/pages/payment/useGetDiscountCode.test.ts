import { renderHook, act } from '@testing-library/react-native';
import { useGetDiscountCode } from '@/hooks/pages/payment/useGetDiscountCode';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';

jest.mock(
  '@/utils/supabase/supabase-store',
  () => require('@/__tests__/setup/mocks.mock').mockSupabase
);
jest.mock('@/hooks/api/useSecureApi');

const mockSecureGet = jest.fn();
const mockUseSecureApi = useSecureApi as jest.MockedFunction<
  typeof useSecureApi
>;

describe('useGetDiscountCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSecureApi.mockReturnValue({
      secureGet: mockSecureGet,
      securePost: jest.fn(),
      protectedGet: jest.fn(),
      protectedPost: jest.fn(),
    });
  });

  it('should initialize with idle status and no discount data', () => {
    const { result } = renderHook(() => useGetDiscountCode());

    expect(result.current.status).toBe(REQUEST_STATUS.idle);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.discountData).toBeNull();
    expect(result.current.isValidating).toBe(false);
  });

  it('should validate discount code successfully', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: { valid: true, amount: 50 },
      error: null,
    });

    const { result } = renderHook(() => useGetDiscountCode());

    let validationResult: any = null;

    await act(async () => {
      validationResult = await result.current.validateCode('SUMMER20');
    });

    expect(validationResult).toEqual({
      isValid: true,
      data: { code: 'SUMMER20', amount: 50 },
    });

    expect(result.current.status).toBe(REQUEST_STATUS.success);
    expect(result.current.discountData).toEqual({
      code: 'SUMMER20',
      amount: 50,
    });
    expect(result.current.errorMessage).toBeNull();

    expect(mockSecureGet).toHaveBeenCalledWith({
      endpoint: SECURE_ENDPOINTS.DISCOUNT.VALIDATE('SUMMER20'),
    });
  });

  it('should trim and uppercase discount code before validation', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: { valid: true, amount: 25 },
      error: null,
    });

    const { result } = renderHook(() => useGetDiscountCode());

    await act(async () => {
      await result.current.validateCode('  winter10  ');
    });

    expect(mockSecureGet).toHaveBeenCalledWith({
      endpoint: SECURE_ENDPOINTS.DISCOUNT.VALIDATE('WINTER10'),
    });

    expect(result.current.discountData).toEqual({
      code: 'WINTER10',
      amount: 25,
    });
  });

  it('should handle invalid discount code from API error', async () => {
    const mockError = {
      es: 'Código inválido',
      en: 'Invalid code',
    };

    mockSecureGet.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useGetDiscountCode());

    let validationResult: any = null;

    await act(async () => {
      validationResult = await result.current.validateCode('INVALID');
    });

    expect(validationResult).toEqual({
      isValid: false,
      data: null,
    });

    expect(result.current.status).toBe(REQUEST_STATUS.error);
    expect(result.current.discountData).toBeNull();
    expect(result.current.errorMessage).toEqual(mockError);
  });

  it('should handle invalid discount code from response data', async () => {
    mockSecureGet.mockResolvedValueOnce({
      data: { valid: false, amount: 0 },
      error: null,
    });

    const { result } = renderHook(() => useGetDiscountCode());

    let validationResult: any = null;

    await act(async () => {
      validationResult = await result.current.validateCode('EXPIRED');
    });

    expect(validationResult).toEqual({
      isValid: false,
      data: null,
    });

    expect(result.current.status).toBe(REQUEST_STATUS.error);
    expect(result.current.discountData).toBeNull();
    expect(result.current.errorMessage).toEqual({
      es: 'Código de descuento inválido',
      en: 'Invalid discount code',
    });
  });

  it('should handle network/unexpected errors', async () => {
    mockSecureGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGetDiscountCode());

    let validationResult: any = null;

    await act(async () => {
      validationResult = await result.current.validateCode('TESTCODE');
    });

    expect(validationResult).toEqual({
      isValid: false,
      data: null,
    });

    expect(result.current.status).toBe(REQUEST_STATUS.error);
    expect(result.current.errorMessage).toEqual({
      es: 'Error al validar código',
      en: 'Error validating code',
    });
  });

  it('should clear discount data and reset state', () => {
    const { result } = renderHook(() => useGetDiscountCode());

    // Manually set some data (simulating previous validation)
    act(() => {
      // This would normally come from validateCode
      result.current.validateCode('TEST');
    });

    act(() => {
      result.current.clearDiscount();
    });

    expect(result.current.discountData).toBeNull();
    expect(result.current.status).toBe(REQUEST_STATUS.idle);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should set isValidating to true during validation', async () => {
    mockSecureGet.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: { valid: true, amount: 10 }, error: null });
          }, 100);
        })
    );

    const { result } = renderHook(() => useGetDiscountCode());

    const validatePromise = act(async () => {
      return result.current.validateCode('SLOW');
    });

    // Check isValidating during the request
    expect(result.current.isValidating).toBe(true);

    await validatePromise;

    expect(result.current.isValidating).toBe(false);
  });

  it('should handle multiple validations sequentially', async () => {
    // First validation - valid
    mockSecureGet.mockResolvedValueOnce({
      data: { valid: true, amount: 100 },
      error: null,
    });

    const { result } = renderHook(() => useGetDiscountCode());

    await act(async () => {
      await result.current.validateCode('CODE1');
    });

    expect(result.current.discountData).toEqual({
      code: 'CODE1',
      amount: 100,
    });

    // Second validation - invalid (should clear first)
    mockSecureGet.mockResolvedValueOnce({
      data: { valid: false, amount: 0 },
      error: null,
    });

    await act(async () => {
      await result.current.validateCode('CODE2');
    });

    expect(result.current.discountData).toBeNull();
    expect(result.current.status).toBe(REQUEST_STATUS.error);
  });
});
