import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { WonArticles } from '@/components/articles/WonArticles';
import { useGetWonArticlesByAuction } from '@/hooks/pages/article/useGetWonArticlesByAuction';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { useFetchCommission } from '@/hooks/components/useFetchCommission';

export default function ArticlesWonScreen() {
  const { t, locale } = useTranslation();
  const {
    data: articlesWon,
    status,
    errorMessage,
  } = useGetWonArticlesByAuction();
  const {
    data: commissionsData,
    status: commissionsStatus,
    errorMessage: commissionsErrorMessage,
  } = useFetchCommission();

  if (
    status === REQUEST_STATUS.loading ||
    status === REQUEST_STATUS.idle ||
    commissionsStatus === REQUEST_STATUS.loading ||
    commissionsStatus === REQUEST_STATUS.idle
  ) {
    return <Loading locale={locale} />;
  }

  if (
    status === REQUEST_STATUS.error ||
    commissionsStatus === REQUEST_STATUS.error
  ) {
    return (
      <CustomError
        customMessage={errorMessage || commissionsErrorMessage}
        refreshRoute='/(tabs)/account/articles-won'
      />
    );
  }

  return (
    <View className='flex-1 px-4'>
      {articlesWon ? (
        <WonArticles
          wonArticles={articlesWon}
          lang={locale}
          commissionValue={commissionsData}
          texts={{
            winningBid: t('screens.account.winningBid'),
            payArticles: t('screens.account.payArticles'),
            view: t('screens.account.viewArticle'),
          }}
        />
      ) : (
        <View className='flex-1 items-center justify-center px-6'>
          <CustomText type='body'>
            {t('screens.account.noArticlesWon')}
          </CustomText>
        </View>
      )}
    </View>
  );
}
