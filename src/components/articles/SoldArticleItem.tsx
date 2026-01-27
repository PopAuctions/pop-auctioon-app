import React, { useMemo } from 'react';
import { Image, Text, View } from 'react-native';
import { CustomPaidArticle, Lang } from '@/types/types';
import { euroFormatter } from '@/utils/euroFormatter';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomText } from '@/components/ui/CustomText';
import {
  UserPaymentStatus,
  UserPaymentStatusLabels,
  WonArticleStatus,
} from '@/constants';

interface SoldArticleItemProps {
  lang: Lang;
  article: CustomPaidArticle;
  reviewUrl: `/${string}`;
  texts: {
    soldPrice: string;
    status: string;
    pending: string;
    paid: string;
    onlineStore: string;
  };
}

export function SoldArticleItem({
  lang,
  texts,
  article,
  reviewUrl,
}: SoldArticleItemProps) {
  const formatter = useMemo(() => euroFormatter(lang, 2), [lang]);

  const status = useMemo(() => {
    if (article?.payment) {
      const paymentStatus = article.payment
        .status as keyof typeof UserPaymentStatusLabels;
      return UserPaymentStatusLabels[paymentStatus]?.[lang] ?? '';
    }

    return article.status !== WonArticleStatus.PAID
      ? texts.pending
      : texts.paid;
  }, [article?.payment, article?.status, lang, texts.pending, texts.paid]);

  const approved = article?.payment?.status === UserPaymentStatus.APPROVED;

  const subtitle = useMemo(() => {
    if (!article?.payment) return article?.Article?.Auction?.title ?? '';

    return article?.payment?.Auction?.title ?? texts.onlineStore;
  }, [article?.payment, article?.Article?.Auction?.title, texts.onlineStore]);

  const imageUri = article?.Article?.images?.[0];
  const title = article?.Article?.title ?? '';
  const soldPrice = article?.Article?.soldPrice ?? 0;

  return (
    <View className='w-full flex-row gap-4'>
      {/* Image / Link */}
      <CustomLink
        href={reviewUrl}
        className='w-full max-w-[208px]' // ~max-w-52 equivalent
      >
        <View className='aspect-square w-full overflow-hidden rounded-lg bg-neutral-100'>
          {!!imageUri && (
            <Image
              source={{ uri: imageUri }}
              accessibilityLabel={title}
              className='h-full w-full'
              resizeMode='cover'
            />
          )}
        </View>
      </CustomLink>

      {/* Details */}
      <View className='flex-1'>
        <CustomText
          type='h4'
          className=''
        >
          {title}
        </CustomText>

        <CustomText
          type='bodysmall'
          className='text-start'
        >
          {subtitle}
        </CustomText>

        <CustomText type='body'>
          {texts.soldPrice}: {formatter.format(soldPrice)}
        </CustomText>

        {/* status line with colored status */}
        <CustomText type='body'>
          {texts.status}:{' '}
          <Text className={approved ? 'text-cinnabar' : ''}>{status}</Text>
        </CustomText>
      </View>
    </View>
  );
}
