import * as Linking from 'expo-linking';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';

/**
 * Hook to handle opening terms and conditions PDF
 * Provides error handling with toast notifications
 */
export const useOpenTerms = () => {
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);

  const handleOpenTerms = async () => {
    const termsUrl = 'https://www.popauction.com/documents/TC-2025-07-14.pdf';
    const supported = await Linking.canOpenURL(termsUrl);

    if (supported) {
      await Linking.openURL(termsUrl);
    } else {
      callToast({
        variant: 'error',
        description: {
          es: 'No se pudo abrir el documento',
          en: 'Could not open document',
        },
      });
    }
  };

  return { handleOpenTerms };
};
