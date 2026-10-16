import React, { ReactNode, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/fields/SelectField';
import { SELECTABLE_AUCTION_CATEGORIES } from '@/constants/auctions';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface SelectCategoryModalProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function SelectCategoryModal({
  children,
  title,
  description,
}: SelectCategoryModalProps) {
  const { locale, t } = useTranslation();
  const categoryLabels = t('displayLabels.auctionCategorySelection', {
    locale,
  });
  const categoryOptions = SELECTABLE_AUCTION_CATEGORIES.map((value) => ({
    value,
    label: categoryLabels[value],
  }));
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
                <CustomText type='h4'>{title}</CustomText>
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
                {description}
              </CustomText>

              {/* Form */}
              <View className='mt-4'>
                <View className='mb-4'>
                  <SelectField
                    name='selected-category'
                    value={selectedCategory}
                    options={categoryOptions}
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
                  {t('common.actions.confirm')}
                </Button>

                <Button
                  mode='secondary'
                  className='flex-1'
                  onPress={closeModal}
                >
                  {t('common.actions.cancel')}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
