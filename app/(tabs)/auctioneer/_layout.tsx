import { SmartBack } from '@/components/ui/SmartBack';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Stack } from 'expo-router';

const INDEX_ROUTE = '/(tabs)/auctioneer';

export default function AuctioneerLayout() {
  const { t } = useTranslation();

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
          title: t('tabsNames.myAuctions'),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-auctions/new'
        options={{
          title: t('screens.myAuctions.newAuction'),
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='my-auctions/old'
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
