import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['top', 'bottom']}
      >
        <View className='flex-1 items-center justify-center gap-6 px-6'>
          {/* Title */}
          <CustomText
            type='h1'
            className='text-center'
          >
            {t('notFound.pageNotFound')}
          </CustomText>

          {/* Description */}
          <CustomText
            type='body'
            className='text-gray-600 text-center'
          >
            {t('notFound.description')}
          </CustomText>

          {/* Go to Home Button */}
          <Button
            mode='primary'
            size='large'
            onPress={() => router.replace('/(tabs)/home')}
            className='w-full max-w-xs'
          >
            {t('notFound.goHome')}
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
}
