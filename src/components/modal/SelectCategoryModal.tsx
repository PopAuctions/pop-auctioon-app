import React, { ReactNode, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/fields/SelectField';
import { Lang } from '@/types/types';
import { AUCTION_CATEGORIES_LANG } from '@/constants/auctions';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';

interface SelectCategoryModalProps {
  children: ReactNode;
  title: { en: string; es: string };
  description: { en: string; es: string };
  locale: Lang;
}

const TEXTS = {
  es: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },
  en: {
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
} as const;

export function SelectCategoryModal({
  children,
  title,
  description,
  locale,
}: SelectCategoryModalProps) {
  const [visible, setVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { navigateWithAuth } = useAuthNavigation();

  const handleChange = (value: string | null) => {
    setSelectedCategory(value);
  };

  const openModal = () => setVisible(true);
  const closeModal = () => {
    setVisible(false);
  };

  const handleConfirm = async () => {
    if (!selectedCategory) return;

    navigateWithAuth(
      `/(tabs)/auctioneer/my-online-store/articles/new?category=${selectedCategory}`
    );

    closeModal();
  };

  return (
    <>
      <Button
        mode='primary'
        onPress={openModal}
        size='small'
        textClassName='text-center'
      >
        {children}
      </Button>

      <Modal
        animationType='fade'
        transparent
        visible={visible}
        onRequestClose={closeModal}
      >
        <View className='flex-1 bg-black/40'>
          <Pressable
            className='absolute inset-0'
            onPress={closeModal}
          />

          {/* Centered card (keep same styles) */}
          <View className='flex-1 items-center justify-center px-6'>
            <View className='w-full max-w-[420px] rounded-xl bg-white p-4 shadow-lg'>
              <View className='flex flex-row justify-between'>
                <CustomText type='h4'>{title[locale]}</CustomText>
                <Pressable
                  onPress={closeModal}
                  hitSlop={16}
                >
                  <FontAwesomeIcon
                    variant='bold'
                    name='close'
                    size={15}
                    color='cinnabar'
                  />
                </Pressable>
              </View>

              {/* Header */}
              <CustomText
                type='body'
                className='text-sm text-neutral-600'
              >
                {description[locale]}
              </CustomText>

              {/* Form */}
              <View className='mt-4'>
                <View className='mb-4'>
                  <SelectField
                    name='selected-category'
                    value={selectedCategory}
                    options={AUCTION_CATEGORIES_LANG[locale]}
                    onChange={handleChange}
                    formField={true}
                    isSearchable={true}
                  />
                </View>
              </View>

              {/* Footer buttons */}
              <View className='mt-4 flex-row gap-3'>
                <Button
                  mode='primary'
                  className='flex-1'
                  onPress={handleConfirm}
                  disabled={!selectedCategory}
                >
                  {TEXTS[locale].confirm}
                </Button>

                <Button
                  mode='secondary'
                  className='flex-1'
                  onPress={closeModal}
                >
                  {TEXTS[locale].cancel}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
