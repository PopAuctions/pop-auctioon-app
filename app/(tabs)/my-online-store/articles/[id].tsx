import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { useGetOnlineStoreArticle } from '@/hooks/pages/online-store/useGetOnlineStoreArticle';
import { parseNumber } from '@/utils/parse-number';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants/app';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomImage } from '@/components/ui/CustomImage';
import { euroFormatter } from '@/utils/euroFormatter';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { ArticleDetailsActions } from '@/components/my-online-store/ArticleDetailsActions';

export default function MyOnlineStoreArticleDetailsScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const articleId = parseNumber(id);

  const {
    data: onlineStoreArticle,
    status,
    errorMessage,
    refetch,
  } = useGetOnlineStoreArticle({
    articleId,
  });

  const { data: commissionAmount, status: commissionStatus } =
    useFetchCommissions();

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  const article = onlineStoreArticle?.Article;

  if (
    status === REQUEST_STATUS.error ||
    !onlineStoreArticle ||
    !article?.images
  ) {
    return (
      <View className='flex-1 items-center justify-center'>
        <CustomText type='h2'>{errorMessage?.[locale]}</CustomText>
      </View>
    );
  }

  const articleOSDetailsLang = t('screens.articleOSDetails');
  const onlineStoreArticlePrice = onlineStoreArticle?.price;
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;
  const formatter = euroFormatter(locale);
  const commissionedPrice = getArticleCommissionedPrice(
    onlineStoreArticlePrice ?? 0,
    commissionAmount
  );

  return (
    <ScrollView className='flex-1'>
      <View className='mx-auto w-full px-5 py-4 pb-16'>
        {/* Main */}
        <View className='w-full items-center'>
          <View className='w-full max-w-4xl'>
            <CustomLink
              href={`/(tabs)/online-store/articles/${articleId}`}
              className='mx-auto flex-row gap-4'
            >
              <CustomImage
                src={article.images[0]}
                alt={`${article.title} image`}
                accessibilityLabel={`${article.title} image`}
                className='h-[250px] w-[250px] rounded-2xl'
                resizeMode='cover'
              />
            </CustomLink>

            <View className='mt-4'>
              <CustomText
                type='h2'
                className='text-center text-cinnabar'
              >
                {article.title}
              </CustomText>

              <View className='mt-4'>
                <CustomText type='h4'>
                  {articleOSDetailsLang.commissionedPrice}:{' '}
                  {formatter.format(commissionedPrice)}
                </CustomText>

                <CustomText
                  type='body'
                  className='text-xl'
                >
                  {articleOSDetailsLang.price}:{' '}
                  {formatter.format(onlineStoreArticlePrice)}
                </CustomText>
              </View>

              {!!article?.codeNumber && (
                <CustomText
                  type='body'
                  className='text-xl'
                >
                  {articleOSDetailsLang.code}: {article.codeNumber}
                </CustomText>
              )}
            </View>
          </View>

          {/* Actions */}
          <View className='mt-4 w-full'>
            <CustomText
              type='subtitle'
              className='text-2xl text-cinnabar'
            >
              {articleOSDetailsLang.actions}
            </CustomText>

            <View className='w-full flex-1'>
              <ArticleDetailsActions
                articleSecondChanceId={onlineStoreArticle.id}
                currentPrice={onlineStoreArticlePrice}
                TEXTS={{
                  assignToAuction: articleOSDetailsLang.assignToAuction,
                  remove: articleOSDetailsLang.remove,
                  changePrice: articleOSDetailsLang.changePrice,
                  orderImages: articleOSDetailsLang.orderImages,
                  editImages: articleOSDetailsLang.editImages,
                }}
                locale={locale}
                currentStatus={onlineStoreArticle.status}
                commissionValue={isCommissionReady ? commissionAmount : null}
                refetch={refetch}
              />
            </View>
          </View>

          {/* Offers */}
          <View className='mt-4 w-full'>
            <CustomText
              type='subtitle'
              className='text-2xl text-cinnabar'
            >
              {articleOSDetailsLang.offers}
            </CustomText>

            <View className='mt-4'>
              {/* <ArticleOffersList
                offers={articleSecondChance?.ArticleOffer ?? []}
                locale={locale}
                articleOSDetailsLang{{
                  noOffers: articleOSDetailsLang.noOffers,
                  accept: articleOSDetailsLang.accept,
                  reject: articleOSDetailsLang.reject,
                }}
              /> */}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
