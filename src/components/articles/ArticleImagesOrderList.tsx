import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { CustomImage } from '@/components/ui/CustomImage';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';

type ArticleImagesOrderListProps = {
  images: string[];
  isSaving: boolean;
  onSaveOrder: (newOrder: string[]) => void | Promise<void>;
};

export function ArticleImagesOrderList({
  images,
  isSaving,
  onSaveOrder,
}: ArticleImagesOrderListProps) {
  const { t } = useTranslation();
  const [listData, setListData] = useState<string[]>(images);

  const auctionLang = t('screens.myAuction');

  useEffect(() => {
    setListData(images);
  }, [images]);

  const handleDragEnd = ({ data }: { data: string[] }) => {
    console.log('New order of images:', data);
    setListData(data);
  };

  const handleSave = () => {
    onSaveOrder(listData);
  };

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<string>) => {
    const index = getIndex?.() ?? 0;

    return (
      <Pressable
        onLongPress={drag}
        delayLongPress={150}
      >
        <View
          className={`mb-3 flex-row items-center rounded-xl bg-white px-3 py-2 ${
            isActive ? 'opacity-70' : ''
          }`}
        >
          <View className='h-40 w-40 overflow-hidden rounded-lg bg-slate-200'>
            <CustomImage
              src={item}
              alt={`Article image ${index}`}
              className='h-40 w-40'
            />
          </View>

          {/* Simple drag handle on the right */}
          <View className='ml-auto'>
            <CustomText
              type='body'
              className='text-gray-400 text-2xl'
            >
              <FontAwesomeIcon
                variant='bold'
                name='bars'
                size={20}
              />
            </CustomText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className='flex-1 p-4'>
      <View className='self-end'>
        <Button
          mode='primary'
          className='mb-4'
          isLoading={isSaving}
          disabled={isSaving}
          onPress={handleSave}
        >
          {auctionLang.saveOrder}
        </Button>
      </View>
      <CustomText
        type='body'
        className='mb-4 text-center text-base text-slate-600'
      >
        {auctionLang.dragInstructions}
      </CustomText>

      {/* Draggable list */}
      <DraggableFlatList
        data={listData}
        keyExtractor={(uri) => uri}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        activationDistance={12}
      />
    </View>
  );
}
