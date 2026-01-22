import { ScrollView, View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { useGetSoldArticles } from '@/hooks/pages/article/useGetSoldArticles';
import { SoldArticleItem } from '@/components/articles/SoldArticleItem';
import { CustomText } from '@/components/ui/CustomText';
import { SoldArticlesFilters } from '@/components/articles/SoldArticlesFilters';
import { useGetMyAuctions } from '@/hooks/pages/my-auctions/useGetMyAuctions';
import { useLocalSearchParams } from 'expo-router';

export default function SoldArticlesScreen() {
  const searchParams = useLocalSearchParams<{
    auctionId?: string;
    status?: string;
  }>();
  const { t, locale } = useTranslation();
  const {
    data: articlesSold,
    status: requestStatus,
    errorMessage,
  } = useGetSoldArticles({
    auctionId: searchParams.auctionId,
    status: searchParams.status,
  });

  const { data: auctions } = useGetMyAuctions({ getFinished: true });

  if (
    requestStatus === REQUEST_STATUS.loading ||
    requestStatus === REQUEST_STATUS.idle
  ) {
    return <Loading locale={locale} />;
  }

  if (requestStatus === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/sold-articles'
      />
    );
  }

  const formattedAuctions =
    auctions &&
    auctions.map((auction) => ({
      value: String(auction.id),
      label: `${auction.title} (${new Date(auction.startDate).toLocaleDateString()})`,
    }));

  return (
    <ScrollView className='flex-1 px-4 py-6'>
      <View className='py-4'>
        <SoldArticlesFilters
          locale={locale}
          auctionsList={formattedAuctions ?? []}
        />
      </View>

      {articlesSold ? (
        <>
          {articlesSold.map((article) => (
            <SoldArticleItem
              key={article.id}
              article={article}
              reviewUrl={`/(tabs)/account/sold-articles/${article.id}`}
              lang={locale}
              texts={{
                soldPrice: t('screens.soldArticles.soldPrice'),
                status: t('screens.soldArticles.status'),
                pending: t('screens.soldArticles.pending'),
                paid: t('screens.soldArticles.paid'),
                onlineStore: t('screens.soldArticles.onlineStore'),
              }}
            />
          ))}
        </>
      ) : (
        <View className='flex-1 items-center justify-center px-6'>
          <CustomText
            type='h4'
            className='text-center text-cinnabar'
          >
            {t('screens.soldArticles.noArticles')}
          </CustomText>
        </View>
      )}
    </ScrollView>
  );
}
