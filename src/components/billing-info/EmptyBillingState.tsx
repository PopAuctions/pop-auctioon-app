import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface EmptyBillingStateProps {
  onAddNew: () => void;
  disabled?: boolean;
}

export function EmptyBillingState({
  onAddNew,
  disabled = false,
}: EmptyBillingStateProps) {
  const { t } = useTranslation();

  return (
    <View className='flex-1 items-center justify-center p-6'>
      <CustomText
        type='h2'
        className='mb-2 mt-6 text-center text-cinnabar'
      >
        {t('screens.billingInfo.noBillingYet')}
      </CustomText>
      <CustomText
        type='body'
        className='mb-8 text-center'
      >
        {t('screens.billingInfo.noBillingSubtitle')}
      </CustomText>
      <Button
        mode='primary'
        onPress={onAddNew}
        disabled={disabled}
      >
        {t('screens.billingInfo.addNew')}
      </Button>
    </View>
  );
}
