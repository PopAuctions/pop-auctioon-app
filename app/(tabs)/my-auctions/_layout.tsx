import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { SmartBack } from '@/components/ui/SmartBack';

const INDEX_ROUTE = '/(tabs)/my-auctions';

export default function MyAuctionsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName='index'
      screenOptions={{
        headerShown: true, // Configuración global
        headerTitleAlign: 'center',
        headerLeft: () => {
          return (
            <SmartBack
              fallbackHref={INDEX_ROUTE}
              label={t('tabsNames.back')}
            />
          );
        },
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.myAuctions'),
          headerShown: true,
          headerLeft: () => null, // Oculta el botón de retroceso en la pantalla principal
        }}
      />
      <Stack.Screen
        name='new'
        options={{
          title: t('screens.myAuctions.newAuction'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='old'
        options={{
          title: t('screens.myAuctions.oldAuctions'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          title: t('screens.auctions.detail'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      {/* <Stack.Screen
        name='[id]/edit'
        options={{
          title: t('screens.myAuction.edit'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      /> */}
      <Stack.Screen
        name='[id]/new-article'
        options={{
          title: t('screens.myAuction.newArticle'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]/edit-article/[slug]'
        options={{
          title: t('screens.myAuction.editArticle'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]/rearrange-article-images/[slug]'
        options={{
          title: t('screens.myAuction.rearrangeArticleImages'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
