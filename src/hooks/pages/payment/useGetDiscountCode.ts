import { useState, useCallback } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { REQUEST_STATUS } from '@/constants';
import type { LangMap, RequestStatus } from '@/types/types';

/**
 * Backend response for discount code validation
 */
interface DiscountCodeResponse {
  valid: boolean;
  amount: number;
}

/**
 * Hook to validate discount codes
 * Calls backend to check if code is valid and get discount amount
 *
 * @example
 * ```typescript
 * const { validateCode, isValidating, discountData, clearDiscount } = useGetDiscountCode();
 *
 * const handleApply = async () => {
 *   const result = await validateCode('SUMMER2024');
 *   if (result) {
 *     // discountData now contains { code, discountAmount, ... }
 *   }
 * };
 * ```
 */
export const useGetDiscountCode = () => {
  const { secureGet } = useSecureApi();
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const [discountData, setDiscountData] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  /**
   * Validate a discount code with the backend
   * @param code - Discount code to validate
   * @returns true if valid, false otherwise
   */
  const validateCode = useCallback(
    async (code: string): Promise<boolean> => {
      setStatus(REQUEST_STATUS.loading);
      setErrorMessage(null);

      try {
        const cleanCode = code.trim().toUpperCase();
        const response = await secureGet<DiscountCodeResponse>({
          endpoint: SECURE_ENDPOINTS.DISCOUNT.VALIDATE(cleanCode),
        });

        if (response.error) {
          setErrorMessage(response.error);
          setStatus(REQUEST_STATUS.error);
          setDiscountData(null);
          return false;
        }

        if (!response.data || !response.data.valid) {
          setErrorMessage(
            response.error || {
              es: 'Código de descuento inválido',
              en: 'Invalid discount code',
            }
          );
          setStatus(REQUEST_STATUS.error);
          setDiscountData(null);
          return false;
        }

        // Valid discount code - guardar code junto con amount
        setDiscountData({
          code: cleanCode,
          amount: response.data.amount,
        });
        setStatus(REQUEST_STATUS.success);
        setErrorMessage(null);
        return true;
      } catch {
        setErrorMessage({
          es: 'Error al validar código',
          en: 'Error validating code',
        });
        setStatus(REQUEST_STATUS.error);
        setDiscountData(null);
        return false;
      }
    },
    [secureGet]
  );

  /**
   * Clear current discount data and reset state
   */
  const clearDiscount = useCallback(() => {
    setDiscountData(null);
    setStatus(REQUEST_STATUS.idle);
    setErrorMessage(null);
  }, []);

  return {
    validateCode,
    isValidating: status === REQUEST_STATUS.loading,
    status,
    errorMessage,
    discountData,
    clearDiscount,
  };
};
