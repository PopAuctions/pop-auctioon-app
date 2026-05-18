import { CustomError } from '@/components/ui/CustomError';
import { SmartBack } from '@/components/ui/SmartBack';
import { REQUEST_STATUS } from '@/constants';
import { useFetchUserStore } from '@/hooks/components/useFetchUserStore';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

const INDEX_ROUTE = '/(tabs)/auctioneer';

export default function AuctioneerLayout() {
  const { t } = useTranslation();
  const { data: userStore, status: storeStatus } = useFetchUserStore();

  if (
    storeStatus === REQUEST_STATUS.idle ||
    storeStatus === REQUEST_STATUS.loading ||
    !userStore
  ) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator
          size='large'
          color='#d75639'
        />
      </View>
    );
  }

  if (!userStore.active) {
    return (
      <CustomError
        customMessage={{
          en: 'Your account is not yet active. Wait for activation or contact support for more information.',
          es: 'Tu cuenta aún no está activa. Espera a que la activemos o contacta con soporte para más información.',
        }}
        refreshRoute='/(tabs)/auctioneer'
      />
    );
  }

  return (
    <Stack
      initialRouteName='index'
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerLeft: () => (
          <SmartBack
            fallbackHref={INDEX_ROUTE}
            label={t('tabsNames.back')}
          />
        ),
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.auctioneer'),
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />

      {/* MY AUCTIONS */}
      <Stack.Screen
        name='my-auctions/index'
        options={{
          title: t('screens.auctioneer.myAuctions'),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-auctions/new/index'
        options={{
          title: t('screens.myAuctions.newAuction'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-auctions/old/index'
        options={{
          title: t('screens.myAuctions.oldAuctions'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-auctions/[id]'
        options={{
          title: t('screens.auctions.detail'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-auctions/[id]/new-article'
        options={{
          title: t('screens.myAuction.newArticle'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-auctions/[id]/edit-article/[slug]'
        options={{
          title: t('screens.myAuction.editArticle'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-auctions/[id]/rearrange-article-images/[slug]'
        options={{
          title: t('screens.myAuction.rearrangeArticleImages'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />

      {/* MY ONLINE STORE */}
      <Stack.Screen
        name='my-online-store/index'
        options={{
          title: t('tabsNames.myOnlineStore'),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-online-store/articles/new'
        options={{
          title: t('screens.newArticle.pageTitle'),
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name='my-online-store/articles/[id]'
        options={{
          title: t('screens.articleOSDetails.title'),
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='my-online-store/articles/[id]/rearrange-images'
        options={{
          title: t('screens.rearrangeImages.title'),
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='sold-articles'
        options={{
          title: t('screens.account.soldArticles'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='sold-articles/[id]'
        options={{
          title: t('screens.account.soldArticle'),
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
