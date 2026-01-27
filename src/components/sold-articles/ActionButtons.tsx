import { useState } from 'react';
import { View } from 'react-native';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Lang, LangMap } from '@/types/types';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useToast } from '@/hooks/useToast';

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
        title={{
          es: 'Notificar de nuevo',
          en: 'Notify again',
        }}
        description={{
          es: '¿Estás seguro de que quieres notificar de nuevo al usuario? Se le enviará un correo electrónico con las instrucciones para completar el pago.',
          en: 'Are you sure you want to notify the user again? An email will be sent to them with instructions to complete the payment.',
        }}
        importantMessage={{
          es: 'No podrás revertir esta acción.',
          en: 'You will not be able to revert this action.',
        }}
        locale={locale}
      >
        {texts.notifyAgain}
      </ConfirmModal>
      <ConfirmModal
        mode='secondary'
        onConfirm={handleSendToOnlineStore}
        isDisabled={isLoading}
        title={{
          en: 'Send to online store',
          es: 'Enviar a tienda online',
        }}
        description={{
          en: 'Are you sure you want to send this article to the online store? The user will no longer be able to make the payment for this article and you will have to manually enable the article on your online store articles',
          es: '¿Estás seguro de que quieres enviar el artículo a la tienda en linea? El usuario ya no podrá hacer el pago por este artículo y deberas activar el artículo manualmente en tus artículos de la tienda online',
        }}
        importantMessage={{
          es: 'No podrás revertir esta acción.',
          en: 'You will not be able to revert this action.',
        }}
        locale={locale}
      >
        {texts.sendToOnlineStore}
      </ConfirmModal>
      <ConfirmModal
        mode='secondary'
        onConfirm={handleCancelAcquisition}
        isDisabled={isLoading}
        title={{
          en: 'Cancel acquisition',
          es: 'Cancelar adquisición',
        }}
        description={{
          en: 'Are you sure you want to cancel the acquisition? The user will no longer be able to make the payment for this article and you will not be able to manage this article any more.',
          es: '¿Estás seguro de que quieres cancelar la adquisición? El usuario ya no podrá hacer el pago por este artículo y no podrás gestionar más este artículo.',
        }}
        importantMessage={{
          es: 'No podrás revertir esta acción.',
          en: 'You will not be able to revert this action.',
        }}
        locale={locale}
      >
        {texts.cancelAcquisition}
      </ConfirmModal>
    </View>
  );
};
