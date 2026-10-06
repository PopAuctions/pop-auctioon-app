import { type Lang } from '@/types/types';
import { View } from '../Themed';
import { CustomText } from './CustomText';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export const Loading = ({
  customMessage,
}: {
  locale?: Lang;
  customMessage?: string;
}) => {
  const { t } = useTranslation();

  return (
    <View className='flex-1 items-center justify-center'>
      <ActivityIndicator
        size='large'
        color='#d75639'
      />
      <CustomText
        type='body'
        className='mt-4 text-center text-black'
      >
        {customMessage ?? t('common.status.loading')}
      </CustomText>
    </View>
  );
};
