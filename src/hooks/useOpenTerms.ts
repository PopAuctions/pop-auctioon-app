import * as Linking from 'expo-linking';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useFetchLegalContent } from '@/hooks/pages/useFetchLegalContent';
import type { MessageKey } from '@/i18n';

const DOCUMENT_OPEN_ERROR =
  'errors.document.openFailed' as const satisfies MessageKey;

/**
 * Hook to handle opening terms and conditions PDF
 * Fetches URL from backend and opens directly in browser
 * No screen rendering needed
 */
export const useOpenTerms = () => {
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { data: legalContent } = useFetchLegalContent();

  const handleOpenTerms = async () => {
    // Obtener URL del backend
    const termsUrl =
      legalContent?.termsAndConditions?.pdfUrl ||
      'https://www.popauction.com/documents/TC-2026-07-01.pdf';

    const supported = await Linking.canOpenURL(termsUrl);

    if (supported) {
      await Linking.openURL(termsUrl);
    } else {
      callToast({
        variant: 'error',
        description: DOCUMENT_OPEN_ERROR,
      });
    }
  };

  return { handleOpenTerms };
};
