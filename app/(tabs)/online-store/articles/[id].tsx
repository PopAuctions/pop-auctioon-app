import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ARTICLE_BRANDS_LABELS, REQUEST_STATUS } from '@/constants';
import { CustomText } from '@/components/ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { ImagesCarousel } from '@/components/ui/ImagesCarousel';
import { ArticleSpecificationsSection } from '@/components/articles/ArticleSpecificationsSection';
import { formatTextToParagraph } from '@/utils/formatTextToParagraph';
import { parseNumber } from '@/utils/parse-number';
import { useGetOnlineStoreArticle } from '@/hooks/pages/online-store/useGetOnlineStoreArticle';
import { OnlineStorePriceInfo } from '@/components/online-store/OnlineStorePriceInfo';
import { ArticleOfferForm } from '@/components/online-store/ArticleOfferForm';

export default function ArticlesDetailScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const articleLang = t('screens.article');
  const onlineStoreArticleTexts = t('screens.onlineStoreArticle');
  const articleId = parseNumber(id);

  const {
    data: onlineStoreArticle,
    status,
    errorMessage,
  } = useGetOnlineStoreArticle({
    articleId,
  });

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !onlineStoreArticle) {
    return (
      <View className='flex-1 items-center justify-center'>
        <CustomText type='h2'>{errorMessage?.[locale]}</CustomText>
      </View>
    );
  }

  const article = onlineStoreArticle.Article;

  return (
    <>
      <ScrollView className='w-full'>
        <View className='mx-auto mt-4 w-full max-w-[672px] px-5 md:max-w-[896px]'>
          {/* MAIN */}
          <View className='w-full flex-col items-center pb-16'>
            {/* SECTION: Header */}
            <View className='w-full flex-col items-center justify-center gap-2'>
              <View className='items-center'>
                <CustomText
                  type='body'
                  className='text-center text-cinnabar'
                >
                  {
                    ARTICLE_BRANDS_LABELS[
                      article.brand as keyof typeof ARTICLE_BRANDS_LABELS
                    ]
                  }
                </CustomText>

                <CustomText
                  type='h1'
                  className='text-center'
                >
                  {article.title}
                </CustomText>
              </View>
            </View>

            {/* SECTION: Image slider */}
            <View className='mt-10 w-full flex-row justify-center gap-10 px-5 md:px-0'>
              <ImagesCarousel images={article.images!} />
            </View>

            {/* SECTION: Price & Offer */}
            <View className='mx-auto mt-10 w-full flex-col justify-around gap-5  md:flex-row'>
              <View className='w-full md:w-2/6'>
                <OnlineStorePriceInfo
                  lang={locale}
                  currentPrice={onlineStoreArticle.price}
                  texts={{
                    shipping: articleLang.shippingCosts,
                    price: articleLang.price,
                  }}
                />
              </View>
              <View className='w-full md:w-4/6'>
                <ArticleOfferForm
                  onlineStoreArticleId={onlineStoreArticle.id}
                  minOffer={onlineStoreArticle.minOffer}
                  lang={locale}
                  texts={{
                    minOffer: onlineStoreArticleTexts.minOffer,
                    submit: onlineStoreArticleTexts.makeOffer,
                    penalty: onlineStoreArticleTexts.penalty,
                  }}
                />
              </View>
            </View>

            {/* SECTION: Specifications & Description & Observations */}
            <View className='mt-10 w-full flex-col gap-3 md:flex-row md:gap-5'>
              <ArticleSpecificationsSection
                article={article}
                articleLang={articleLang}
                lang={locale}
                articleCategory={article.category}
              />

              {!!article?.observations && (
                <View className='w-full rounded-md border border-neutral-300 p-4 md:flex-1'>
                  <>
                    <Text className='text-2xl font-bold'>
                      {articleLang.observations}
                    </Text>
                    {formatTextToParagraph(article.observations)}
                  </>
                </View>
              )}
              <View className='w-full rounded-md border border-neutral-300 p-4 md:flex-1'>
                <Text className='text-2xl font-bold'>
                  {articleLang.description}
                </Text>
                {formatTextToParagraph(article.description ?? '')}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
