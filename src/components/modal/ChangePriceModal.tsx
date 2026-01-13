import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { euroFormatter } from '@/utils/euroFormatter';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { Lang } from '@/types/types';

type ChangePriceModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => Promise<boolean>;
  title: { en: string; es: string };
  description: { en: string; es: string };
  defaultValue?: string;
  label: { en: string; es: string };
  id: string;
  locale: Lang;
  commissionValue: number | null;
  inputPlaceholder?: { en: string; es: string };
  helperText?: string;
};

const TEXTS = {
  es: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    commissionedPrice: 'Precio con comisión',
    noDecimals: 'No se permiten decimales',
  },
  en: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    commissionedPrice: 'Commissioned Price',
    noDecimals: 'No decimals allowed',
  },
} as const;

export function ChangePriceModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  defaultValue,
  label,
  id,
  locale,
  commissionValue,
  inputPlaceholder,
  helperText,
}: ChangePriceModalProps) {
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
              <CustomText type='h4'>{title[locale]}</CustomText>
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
              {description[locale]}
            </CustomText>

            {/* Form */}
            <View className='mt-4'>
              <CustomText type='body'>{label[locale]}</CustomText>

              <TextInput
                value={inputValue}
                onChangeText={handleChange}
                placeholder={inputPlaceholder ? inputPlaceholder[locale] : ''}
                keyboardType='number-pad'
                inputMode='numeric'
                className='w-full rounded-xl border border-neutral-300 px-4 py-3 text-base'
              />

              {!!helperText && (
                <CustomText
                  type='body'
                  className='text-xs text-neutral-500'
                >
                  {TEXTS[locale].noDecimals}
                </CustomText>
              )}
            </View>

            {/* Commissioned price preview */}
            <View className='mt-2 flex-row items-center gap-1'>
              <CustomText
                type='body'
                className='text-sm'
              >
                {TEXTS[locale].commissionedPrice}:
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
                {TEXTS[locale].confirm}
              </Button>

              <Button
                mode='secondary'
                className='flex-1'
                onPress={onClose}
                disabled={isLoading}
              >
                {TEXTS[locale].cancel}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
