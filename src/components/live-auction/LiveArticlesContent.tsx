import React, { useEffect, useMemo, useRef } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { CustomText } from '@/components/ui/CustomText';
import type { CustomArticleLiveAuto, Lang } from '@/types/types';
import { LiveArticlesListItem } from './LiveArticlesListItem';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';

type StreamInfoModalProps = {
  onClose: () => void;
  articles: CustomArticleLiveAuto[];
  currentArticleId: number;
  locale: Lang;
  commissionValue: number;
  texts: {
    bids: string;
    estimatedPrice: string;
    liveNow: string;
    articles: string;
  };
};

export const LiveArticlesContent = ({
  onClose,
  articles,
  currentArticleId,
  locale,
  commissionValue,
  texts,
}: StreamInfoModalProps) => {
  const listRef = useRef<FlatList<CustomArticleLiveAuto>>(null);

  const formatter = useMemo(() => euroFormatter(locale), [locale]);

  const liveIndex = useMemo(() => {
    return articles.findIndex((a) => a.id === currentArticleId);
  }, [articles, currentArticleId]);

  useEffect(() => {
    if (liveIndex < 0) return;

    // Give the Modal a tick to lay out before scrolling
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: liveIndex,
        animated: true,
        viewPosition: 0.2,
      });
    });
  }, [liveIndex]);

  return (
    <View className='w-full max-w-md overflow-hidden rounded-2xl bg-white/70 pb-4'>
      {/* Header */}
      <View className='border-gray-200 flex-row items-center justify-between border-b px-6 py-4'>
        <CustomText
          type='subtitle'
          className='text-xl'
        >
          {texts.articles}
        </CustomText>

        <TouchableOpacity
          onPress={onClose}
          hitSlop={10}
        >
          <FontAwesomeIcon
            variant='bold'
            name='close'
            size={24}
            color='cinnabar'
          />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        ref={listRef}
        data={articles}
        keyExtractor={(item) => item.id.toString()}
        className='max-h-[520px]'
        contentContainerStyle={{ paddingVertical: 8 }}
        onScrollToIndexFailed={(info) => {
          // fallback when items not measured yet
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: Math.min(info.index, articles.length - 1),
              animated: true,
            });
          }, 80);
        }}
        renderItem={({ item, index }) => (
          <LiveArticlesListItem
            article={item}
            isLive={item.id === currentArticleId}
            index={index + 1}
            commissionValue={commissionValue}
            formatter={formatter}
            texts={texts}
          />
        )}
      />
    </View>
  );
};
