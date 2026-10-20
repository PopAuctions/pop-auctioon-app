import { Modal, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface PaymentAttemptRecoveryModalProps {
  articleTitles: string[];
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  visible: boolean;
}

export function PaymentAttemptRecoveryModal({
  articleTitles,
  isSubmitting,
  onCancel,
  onConfirm,
  visible,
}: PaymentAttemptRecoveryModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View className='flex-1 items-center justify-center bg-black/40 px-5'>
        <View className='w-full max-w-md rounded-2xl bg-white px-5 py-5'>
          <CustomText
            type='h3'
            className='mb-2'
          >
            {t('screens.payment.paymentRecoveryTitle')}
          </CustomText>

          <CustomText
            type='body'
            className='mb-3'
          >
            {t('screens.payment.paymentRecoveryArticleIntro')}
          </CustomText>

          <View className='mb-4 gap-1'>
            {articleTitles.map((articleTitle, index) => (
              <CustomText
                key={`${articleTitle}-${index}`}
                type='body'
              >
                {'• '}
                {articleTitle}
              </CustomText>
            ))}
          </View>

          <CustomText
            type='body'
            className='mb-3'
          >
            {t('screens.payment.paymentRecoveryDescription')}
          </CustomText>

          <CustomText
            type='bold'
            className='mb-5 text-cinnabar'
          >
            {t('screens.payment.paymentRecoveryWarning')}
          </CustomText>

          <View className='flex-row gap-3'>
            <Button
              mode='secondary'
              className='flex-1'
              disabled={isSubmitting}
              onPress={onCancel}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              mode='primary'
              className='flex-1'
              disabled={isSubmitting}
              isLoading={isSubmitting}
              onPress={onConfirm}
            >
              {t('screens.payment.paymentRecoveryConfirm')}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
