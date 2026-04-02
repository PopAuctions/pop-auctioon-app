import React from 'react';
import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import type { CustomArticleSecondChance, Lang } from '@/types/types';
import { euroFormatter } from '@/utils/euroFormatter';
import { ArticleSliderSkeleton } from './ArticleSliderSkeleton';
import { OnlineStoreArticlesSlider } from './OnlineStoreArticlesSlider';
import { CustomLink } from '../ui/CustomLink';

export const OnlineStoreArticlesSection = ({
  lang,
  texts,
  commissionValue,
  articles,
  articlesReady,
}: {
  lang: Lang;
  commissionValue: number | null;
  texts: {
    price: string;
    onlineStoreTitle: string;
    viewMore: string;
  };
  articles: CustomArticleSecondChance[];
  articlesReady: boolean;
}) => {
  const formatter = euroFormatter(lang);

  return (
    <View className='mt-2 w-full gap-2'>
      <CustomText
        type='h2'
        className='text-left'
      >
        {texts.onlineStoreTitle}
      </CustomText>

      <View className='w-full'>
        {articlesReady ? (
          <OnlineStoreArticlesSlider
            articles={articles}
            lang={lang}
            texts={{ price: texts.price }}
            formatter={formatter}
            commissionValue={commissionValue}
          />
        ) : (
          <ArticleSliderSkeleton />
        )}
      </View>
      <View>
        <CustomLink
          className='w-1/2 self-center'
          href='/(tabs)/online-store'
          mode='secondary'
          size='small'
        >
          {texts.viewMore}
        </CustomLink>
      </View>
    </View>
  );
};
