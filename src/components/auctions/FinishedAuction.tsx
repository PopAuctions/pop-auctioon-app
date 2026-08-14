import { View } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { useGetArticlesByAuctionIdAmount } from '@/hooks/pages/article/useGetArticlesByAuctionIdAmount';
import { CustomText } from '../ui/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomLink } from '../ui/CustomLink';
import { Loading } from '../ui/Loading';
import { REQUEST_STATUS } from '@/constants/app';
import { Button } from '../ui/Button';

export const FinishedAuction = ({ auctionId }: { auctionId: string }) => {
  const { t, locale } = useTranslation();
  const { data: wonArticlesAmount, status } =
    useGetArticlesByAuctionIdAmount(auctionId);

  const hasArticlesWon = Boolean(wonArticlesAmount) && wonArticlesAmount > 0;

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  const requestReview = async () => {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    }
  };

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['top']}
    >
      <View className='flex-1'>
        <View className='absolute left-4 top-2 z-10'>
          <CustomLink
            href='/(tabs)/home'
            mode='primary'
            dismissFirst
            replace
            className='w-fit'
          >
            {t('globals.goToHome')}
          </CustomLink>
        </View>

        <View className='flex-1 items-center justify-center px-4'>
          <CustomText
            type='h3'
            className='text-center text-cinnabar'
          >
            {t('screens.liveAuction.thanksForWatching')}
          </CustomText>
          <CustomText
            type='h4'
            className='text-center'
          >
            {t('screens.liveAuction.finished')}
          </CustomText>

          {hasArticlesWon && (
            <CustomText
              type='h4'
              className='mt-5 text-center text-base text-cinnabar'
            >
              {t('screens.liveAuction.ifAnyArticleWon')}
            </CustomText>
          )}

          <View className='mt-6 w-1/2'>
            {hasArticlesWon && (
              <CustomLink
                href='/(tabs)/account/articles-won'
                mode='primary'
                dismissFirst
                replace
                textClassName='text-center'
              >
                {t('screens.liveAuction.goToArticlesWon')}
              </CustomLink>
            )}
            <Button
              onPress={requestReview}
              mode='secondary'
              className='mt-2'
              textClassName='text-center'
            >
              {t('screens.liveAuction.leaveReview')}
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
