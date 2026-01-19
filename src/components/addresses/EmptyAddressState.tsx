import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface EmptyAddressStateProps {
  onAddNew: () => void;
  disabled?: boolean;
}

export function EmptyAddressState({
  onAddNew,
  disabled = false,
}: EmptyAddressStateProps) {
  const { t } = useTranslation();

  return (
    <View className='flex-1 items-center justify-center p-6'>
      <CustomText
        type='h2'
        className='mb-2 mt-6 text-center text-cinnabar'
      >
        {t('screens.addresses.noAddressesYet')}
      </CustomText>
      <CustomText
        type='body'
        className='mb-8 text-center'
      >
        {t('screens.addresses.noAddressesSubtitle')}
      </CustomText>
      <Button
        mode='primary'
        onPress={onAddNew}
        disabled={disabled}
      >
        {t('screens.addresses.addNew')}
      </Button>
    </View>
  );
}
