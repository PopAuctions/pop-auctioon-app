import { ScrollView, View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { useGetFollowedArticles } from '@/hooks/pages/article/useGetFollowedArticles';
import { ArticleItem } from '@/components/articles/ArticleItem';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';
import { euroFormatter } from '@/utils/euroFormatter';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';

export default function FollowedArticlesScreen() {
  const { t, locale } = useTranslation();
  const {
    data: articles,
    status,
    errorMessage,
    refetch,
  } = useGetFollowedArticles();
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();

  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;
  const articleLang = t('screens.article');
  const formatter = euroFormatter(locale);

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || articles === null) {
    return (
      <View className='flex-1 items-center justify-center'>
        <CustomText type='h2'>{errorMessage?.[locale]}</CustomText>
      </View>
    );
  }

  return (
    <ScrollView className='w-full flex-1 p-4'>
      {articles.length === 0 ? (
        <View className='mt-5'>
          <CustomText
            type='h2'
            className='text-center text-cinnabar'
          >
            {t('screens.article.noFollowedArticles')}
          </CustomText>
        </View>
      ) : (
        <View className='flex flex-col gap-4'>
          {articles.map((item) => (
            <ArticleItem
              key={item.id}
              article={item.Article}
              auctionLang={{ currentBid: articleLang.actualBid }}
              formatter={formatter}
              lang={locale}
              userFollows={true}
              commissionValue={isCommissionReady ? commissionData : null}
              actionAfterFollow={refetch}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
