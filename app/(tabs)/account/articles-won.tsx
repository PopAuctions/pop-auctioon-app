import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { WonArticles } from '@/components/articles/WonArticles';
import { useGetWonArticlesByAuction } from '@/hooks/pages/article/useGetWonArticlesByAuction';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export default function ArticlesWonScreen() {
  const { t, locale } = useTranslation();
  const {
    data: articlesWon,
    status,
    errorMessage,
    refetch: refetchArticles,
  } = useGetWonArticlesByAuction();
  const {
    data: commissionsData,
    status: commissionsStatus,
    errorMessage: commissionsErrorMessage,
  } = useFetchCommissions();

  useFocusEffect(
    useCallback(() => {
      refetchArticles?.();
    }, [refetchArticles])
  );

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
            noArticlesWon: t('screens.account.noArticlesWon'),
            removeArticles: t('screens.account.removeArticles'),
          }}
          refetchArticles={refetchArticles}
        />
      ) : (
        <View className='flex-1 items-center justify-center px-6'>
          <CustomText
            type='h4'
            className='text-center text-cinnabar'
          >
            {t('screens.account.noArticlesWon')}
          </CustomText>
        </View>
      )}
    </View>
  );
}
