import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { euroFormatter } from '@/utils/euroFormatter';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { useTranslation } from '@/hooks/i18n/useTranslation';

type ChangePriceModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => Promise<boolean>;
  title: string;
  description: string;
  defaultValue?: string;
  label: string;
  id: string;
  commissionValue: number | null;
  inputPlaceholder?: string;
  helperText?: string;
};

export function ChangePriceModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  defaultValue,
  label,
  id,
  commissionValue,
  inputPlaceholder,
  helperText,
}: ChangePriceModalProps) {
  const { locale, t } = useTranslation();
  const texts = t('components.modals.onlineStoreArticle');
  const [inputValue, setInputValue] = useState(defaultValue ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const formatter = useMemo(() => euroFormatter(locale), [locale]);

  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(Number(inputValue), commissionValue ?? 0),
    [inputValue, commissionValue]
  );

  const handleChange = (value: string) => {
    if (/^\d*$/.test(value)) setInputValue(value);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const response = await onConfirm(inputValue);
    setIsLoading(false);

    if (response) {
      onClose();
    }
  };

  useEffect(() => {
    if (!visible) return;

    setInputValue(defaultValue ?? '');
  }, [visible, defaultValue]);

  return (
    <Modal
      animationType='fade'
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-black/40'>
        <Pressable
          className='absolute inset-0'
          onPress={onClose}
        />

        {/* Centered card (keep same styles) */}
        <View className='flex-1 items-center justify-center px-6'>
          <View className='w-full max-w-[420px] rounded-xl bg-white p-4 shadow-lg'>
            <View className='flex flex-row justify-between'>
              <CustomText type='h4'>{title}</CustomText>
              <Pressable
                onPress={onClose}
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
              <CustomText type='body'>{label}</CustomText>

              <TextInput
                value={inputValue}
                onChangeText={handleChange}
                placeholder={inputPlaceholder ?? ''}
                keyboardType='number-pad'
                inputMode='numeric'
                className='w-full rounded-xl border border-neutral-300 px-4 py-3 text-base'
              />

              {!!helperText && (
                <CustomText
                  type='body'
                  className='text-xs text-neutral-500'
                >
                  {texts.noDecimals}
                </CustomText>
              )}
            </View>

            {/* Commissioned price preview */}
            <View className='mt-2 flex-row items-center gap-1'>
              <CustomText
                type='body'
                className='text-sm'
              >
                {texts.commissionedPrice}:
              </CustomText>
              <CustomText
                type='body'
                className='text-sm font-semibold text-cinnabar'
              >
                {formatter.format(commissionedPrice)}
              </CustomText>
            </View>

            {/* Footer buttons */}
            <View className='mt-4 flex-row gap-3'>
              <Button
                mode='primary'
                className='flex-1'
                onPress={handleConfirm}
                disabled={isLoading}
                isLoading={isLoading}
              >
                {t('common.actions.confirm')}
              </Button>

              <Button
                mode='secondary'
                className='flex-1'
                onPress={onClose}
                disabled={isLoading}
              >
                {t('common.actions.cancel')}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
