import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export default function RegisterScreen() {
  const { t } = useTranslation();

  return (
    <View className='flex-1 items-center justify-center p-6'>
      <CustomText
        type='h1'
        className='mb-4 text-center text-cinnabar'
      >
        {t('screens.account.register')}
      </CustomText>
      <CustomText
        type='body'
        className='text-gray-600 text-center'
      >
        {t('commonActions.inDevelopment')}
      </CustomText>
    </View>
  );
}
