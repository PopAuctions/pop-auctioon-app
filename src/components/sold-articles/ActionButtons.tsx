import { useState } from 'react';
import { View } from 'react-native';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Lang, LangMap } from '@/types/types';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface ActionButtonsProps {
  locale: Lang;
  articleId: string | number;
  texts: {
    notifyAgain: string;
    sendToOnlineStore: string;
    cancelAcquisition: string;
  };
}

export const ActionButtons = ({
  locale,
  articleId,
  texts,
}: ActionButtonsProps) => {
  const { t } = useTranslation();
  const modalTexts = t('components.modals.soldArticle', { locale });
  const [isLoading, setIsLoading] = useState(false);
  const { securePost } = useSecureApi();
  const { callToast } = useToast(locale);

  const handleNotifyAgain = async () => {
    setIsLoading(true);
    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS['SOLD-ARTICLES'].NOTIFY_AGAIN(articleId),
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToOnlineStore = async () => {
    setIsLoading(true);
    try {
      const response = await securePost<LangMap>({
        endpoint:
          SECURE_ENDPOINTS['SOLD-ARTICLES'].SEND_TO_ONLINE_STORE(articleId),
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAcquisition = async () => {
    setIsLoading(true);
    try {
      const response = await securePost<LangMap>({
        endpoint:
          SECURE_ENDPOINTS['SOLD-ARTICLES'].CANCEL_ACQUISITION(articleId),
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className='mt-4 gap-3'>
      <ConfirmModal
        mode='secondary'
        onConfirm={handleNotifyAgain}
        isDisabled={isLoading}
        title={modalTexts.notifyAgainTitle}
        description={modalTexts.notifyAgainDescription}
        importantMessage={modalTexts.importantMessage}
      >
        {texts.notifyAgain}
      </ConfirmModal>
      <ConfirmModal
        mode='secondary'
        onConfirm={handleSendToOnlineStore}
        isDisabled={isLoading}
        title={modalTexts.sendToOnlineStoreTitle}
        description={modalTexts.sendToOnlineStoreDescription}
        importantMessage={modalTexts.importantMessage}
      >
        {texts.sendToOnlineStore}
      </ConfirmModal>
      <ConfirmModal
        mode='secondary'
        onConfirm={handleCancelAcquisition}
        isDisabled={isLoading}
        title={modalTexts.cancelAcquisitionTitle}
        description={modalTexts.cancelAcquisitionDescription}
        importantMessage={modalTexts.importantMessage}
      >
        {texts.cancelAcquisition}
      </ConfirmModal>
    </View>
  );
};
