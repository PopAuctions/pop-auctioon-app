/**
 * Hook para toggle de selección de artículos en checkout
 * Actualiza el estado del artículo en UserArticlesWon entre DRAFT (seleccionado) y NOT_PAID (deseleccionado)
 *
 * Patrón web equivalente: toggleWonArticleStatus() server action
 * Endpoint: POST /api/mobile/secure/user/payments/toggle-article-selection
 *
 * @see MOBILE_ARTICLE_SELECTION_FLOW.md para detalles completos del flujo
 */

import { useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { MessageKey } from '@/i18n';

interface ToggleArticleSelectionParams {
  articleId: number;
  isSelected: boolean;
}

interface ToggleArticleSelectionResult {
  success: boolean;
  error: MessageKey | null;
}

export const useToggleArticleSelection = () => {
  const { securePost } = useSecureApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);

  /**
   * Toggle selección de artículo (DRAFT <-> NOT_PAID)
   * @param articleId - ID del registro en UserArticlesWon
   * @param isSelected - true = DRAFT (seleccionado), false = NOT_PAID (deseleccionado)
   */
  const toggleArticleSelection = async (
    params: ToggleArticleSelectionParams
  ): Promise<ToggleArticleSelectionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await securePost<{ success: boolean }>({
        endpoint: SECURE_ENDPOINTS.PAYMENT.TOGGLE_ARTICLE_SELECTION,
        data: {
          articleId: params.articleId,
          isSelected: params.isSelected,
        },
      });

      if (response.error) {
        const messageKey =
          response.messageCode ?? 'errors.article.toggleWonUpdateFailed';
        setError(messageKey);
        return { success: false, error: messageKey };
      }

      return { success: true, error: null };
    } catch {
      const messageKey = 'errors.article.toggleWonUpdateFailed';
      setError(messageKey);
      return { success: false, error: messageKey };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleArticleSelection,
    isLoading,
    error,
  };
};
