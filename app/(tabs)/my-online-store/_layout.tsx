import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function MyOnlineStoreLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.myOnlineStore'),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='new'
        options={{
          title: t('screens.newArticle.title'),
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='articles/[id]'
        options={{
          title: t('screens.articleOSDetails.title'),
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='articles/[id]/edit-images'
        options={{
          title: t('screens.editImages.title'),
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='articles/[id]/rearrange-images'
        options={{
          title: t('screens.rearrangeImages.title'),
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
    </Stack>
  );
}
