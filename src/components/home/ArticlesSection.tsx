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

  const renderSection = (
    title: string,
    articles: SimpleArticle[],
    ready: boolean
  ) => {
    if (!ready) {
      return (
        <View className='gap-3'>
          <CustomText
            type='h2'
            className='text-left'
          >
            {title}
          </CustomText>

          <View className='w-full'>
            <ArticleSliderSkeleton />
          </View>
        </View>
      );
    }

    if (articles.length === 0) return null;

    return (
      <View className='gap-3'>
        <CustomText
          type='h2'
          className='text-left'
        >
          {title}
        </CustomText>

        <View className='w-full'>
          <ArticlesSlider
            articles={articles}
            lang={lang}
            texts={{ currentBid: texts.currentBid }}
            formatter={formatter}
            commissionValue={commissionValue}
          />
        </View>
      </View>
    );
  };

  return (
    <View className='mt-6 w-full gap-8 pb-10'>
      {renderSection(
        texts.newestArticlesText,
        newestArticles,
        newestArticlesReady
      )}

      {renderSection(
        texts.featuredArticlesText,
        featuredArticles,
        featuredArticlesReady
      )}

      {renderSection(
        texts.mostViewedArticlesText,
        mostViewedArticles,
        mostViewedArticlesReady
      )}
    </View>
  );
};
