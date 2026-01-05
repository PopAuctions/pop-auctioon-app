import React, { useEffect, useMemo, useRef } from 'react';
import { Modal, View, TouchableOpacity, FlatList } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { CustomText } from '@/components/ui/CustomText';
import type { CustomArticleLiveAuto, Lang } from '@/types/types';
import { LiveArticlesListItem } from './LiveArticlesListItem';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';

type StreamInfoModalProps = {
  visible: boolean;
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

export const LiveArticlesModal = ({
  visible,
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
    if (!visible) return;
    if (liveIndex < 0) return;

    // Give the Modal a tick to lay out before scrolling
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: liveIndex,
        animated: true,
        viewPosition: 0.2,
      });
    });
  }, [visible, liveIndex]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
      className='backdrop-opacity-60'
    >
      <View className='flex-1 items-center justify-center bg-black/70'>
        <View className='mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white/50'>
          {/* Header */}
          <View className='border-gray-200 flex-row items-center justify-between border-b bg-white/70 px-6 py-4'>
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
            className='max-h-[520px]' // keeps it modal-like; adjust if you want taller
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
      </View>
    </Modal>
  );
};
