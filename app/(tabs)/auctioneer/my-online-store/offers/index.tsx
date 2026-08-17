import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants/app';
import { CustomText } from '@/components/ui/CustomText';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { useGetMyStoreCommission } from '@/hooks/pages/store/useGetMyStoreCommission';
import { useGetMyOnlineStoreLatestOffers } from '@/hooks/pages/my-online-store/useGetMyOnlineStoreLatestOffers';
import { LatestArticleOffersCards } from '@/components/my-online-store/LatestArticleOffersCards';

export default function MyOnlineStoreOffersScreen() {
  const { t, locale } = useTranslation();

  const {
    data: articles,
    status,
    errorMessage,
    refetch,
  } = useGetMyOnlineStoreLatestOffers();

  const { data: storeCommission, status: storeCommissionStatus } =
    useGetMyStoreCommission();

  const { data: commissionAmount, status: commissionStatus } =
    useFetchCommissions();

  if (
    status === REQUEST_STATUS.idle ||
    status === REQUEST_STATUS.loading ||
    storeCommissionStatus === REQUEST_STATUS.idle ||
    storeCommissionStatus === REQUEST_STATUS.loading ||
    commissionStatus === REQUEST_STATUS.idle ||
    commissionStatus === REQUEST_STATUS.loading
  ) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !articles) {
    return (
      <View className='flex-1 items-center justify-center px-5'>
        <CustomText
          type='h2'
          className='text-center'
        >
          {errorMessage?.[locale]}
        </CustomText>
      </View>
    );
  }

  const articleOSDetailsLang = t('screens.articleOSDetails');

  return (
    <ScrollView
      className='flex-1'
      contentContainerClassName='px-5 py-4 pb-16'
    >
      <CustomText
        type='h1'
        className='mb-5 text-center'
      >
        {articleOSDetailsLang.offers}
      </CustomText>

      <LatestArticleOffersCards
        articles={articles}
        userCommissionValue={commissionAmount}
        storeCommissionValue={storeCommission}
        locale={locale}
        refetch={refetch}
        texts={{
          noOffers: articleOSDetailsLang.noOffers,
          accept: articleOSDetailsLang.accept,
          reject: articleOSDetailsLang.reject,
          counter: articleOSDetailsLang.counter,
        }}
      />
    </ScrollView>
  );
}
