import React from 'react';
import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import type { Lang, SimpleArticle } from '@/types/types';
import { ArticlesSlider } from './ArticlesSlider';
import { euroFormatter } from '@/utils/euroFormatter';
import { ArticleSliderSkeleton } from './ArticleSliderSkeleton';

export const ArticlesSection = ({
  lang,
  texts,
  commissionValue,
  articles: { newestArticles, featuredArticles, mostViewedArticles },
  articlesReady: {
    newestArticlesReady,
    featuredArticlesReady,
    mostViewedArticlesReady,
  },
}: {
  lang: Lang;
  commissionValue: number | null;
  texts: {
    featuredArticlesText: string;
    newestArticlesText: string;
    mostViewedArticlesText: string;
    currentBid: string;
  };
  articles: {
    newestArticles: SimpleArticle[];
    featuredArticles: SimpleArticle[];
    mostViewedArticles: SimpleArticle[];
  };
  articlesReady: {
    newestArticlesReady: boolean;
    featuredArticlesReady: boolean;
    mostViewedArticlesReady: boolean;
  };
}) => {
  const formatter = euroFormatter(lang);

  return (
    <View
      className='mt-5 w-full'
      style={{ gap: 32 }}
    >
      {newestArticles.length > 0 ? (
        <View style={{ gap: 12 }}>
          <CustomText
            type='h2'
            className='text-left'
          >
            {texts.newestArticlesText}
          </CustomText>

          <View className='w-full'>
            {newestArticlesReady ? (
              <ArticlesSlider
                articles={newestArticles}
                lang={lang}
                texts={{ currentBid: texts.currentBid }}
                formatter={formatter}
                commissionValue={commissionValue}
              />
            ) : (
              <ArticleSliderSkeleton />
            )}
          </View>
        </View>
      ) : null}

      {featuredArticles.length > 0 ? (
        <View style={{ gap: 12 }}>
          <CustomText
            type='h2'
            className='text-left'
          >
            {texts.featuredArticlesText}
          </CustomText>

          <View className='w-full'>
            {featuredArticlesReady ? (
              <ArticlesSlider
                articles={featuredArticles}
                lang={lang}
                texts={{ currentBid: texts.currentBid }}
                formatter={formatter}
                commissionValue={commissionValue}
              />
            ) : (
              <ArticleSliderSkeleton />
            )}
          </View>
        </View>
      ) : null}

      {mostViewedArticles.length > 0 ? (
        <View style={{ gap: 12 }}>
          <CustomText
            type='h2'
            className='text-left'
          >
            {texts.mostViewedArticlesText}
          </CustomText>

          <View className='w-full'>
            {mostViewedArticlesReady ? (
              <ArticlesSlider
                articles={mostViewedArticles}
                lang={lang}
                texts={{ currentBid: texts.currentBid }}
                formatter={formatter}
                commissionValue={commissionValue}
              />
            ) : (
              <ArticleSliderSkeleton />
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
};
