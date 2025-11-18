import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from '../Themed';
import { CustomText } from './CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Button } from './Button';
import { CustomLink } from './CustomLink';
import { type Href, useRouter } from 'expo-router';
import { LangMap } from '@/types/types';

interface CustomErrorProps {
  refreshRoute: Href;
  customMessage?: LangMap | null;
}

export const CustomError = ({
  refreshRoute,
  customMessage,
}: CustomErrorProps) => {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const message = customMessage?.[locale];

  const handleRefresh = () => {
    router.replace(refreshRoute);
  };

  return (
    <SafeAreaView
      className='h-full w-full bg-white'
      edges={['bottom']}
    >
      <View className='flex h-full w-full flex-col items-center justify-center text-center'>
        <CustomText
          type='h2'
          className='mb-4 text-center text-cinnabar'
        >
          {t('commonErrors.generic')}
        </CustomText>
        {message && (
          <CustomText
            type='h4'
            className='mb-2 text-center'
          >
            {message}
          </CustomText>
        )}
        <CustomText
          type='body'
          className='text-center text-base'
        >
          {t('commonErrors.defaultMessage')}
        </CustomText>
        <View className='mt-4 flex flex-row gap-4'>
          <Button
            mode='primary'
            onPress={handleRefresh}
          >
            Refresh page
          </Button>
          <CustomLink
            href='/home'
            mode='secondary'
          >
            Go to home page
          </CustomLink>
        </View>
      </View>
    </SafeAreaView>
  );
};
