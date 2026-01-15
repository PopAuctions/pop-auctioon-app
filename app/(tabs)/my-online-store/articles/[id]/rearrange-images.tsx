import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { useGetOnlineStoreArticle } from '@/hooks/pages/online-store/useGetOnlineStoreArticle';
import { parseNumber } from '@/utils/parse-number';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants/app';
import { CustomText } from '@/components/ui/CustomText';

export default function MyOnlineStoreArticleRearrangeImagesScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
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

  return (
    <ScrollView className='flex-1'>
      <View className='mx-auto w-full px-5 py-4 pb-16'>
        {/* Main */}
        <View className='w-full items-center'></View>
      </View>
    </ScrollView>
  );
}
