import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { euroFormatter } from '@/utils/euroFormatter';
import { useTranslation } from '@/hooks/i18n/useTranslation';

type AutomaticBidModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (maxBidAmount: string) => Promise<boolean> | boolean;
  title: { en: string; es: string };
  description: { en: string; es: string };
  extraMessage: { en: string; es: string };
  defaultValue?: string;
  minAmount: number;
  helperText?: string;
};

const TEXTS = {
  es: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    inputLabel: 'Monto máximo',
    missingValue: 'Ingresa un valor',
    minimumPrice: (amount: string) => `El monto debe ser al menos ${amount}`,
    noDecimals: 'No se permiten decimales',
  },
  en: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    inputLabel: 'Maximum amount',
    missingValue: 'Please enter a value',
    minimumPrice: (amount: string) => `The amount must be at least ${amount}`,
    noDecimals: 'Decimals are not allowed',
  },
} as const;

export function AutomaticBidModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  extraMessage,
  defaultValue,
  minAmount,
  helperText,
}: AutomaticBidModalProps) {
  const { locale } = useTranslation();
  const [inputValue, setInputValue] = useState(defaultValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatter = useMemo(() => euroFormatter(locale), [locale]);

  const handleChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setInputValue(value);
      setError(null);
    }
  };

  const handleConfirm = async () => {
    if (!inputValue) {
      setError(TEXTS[locale].missingValue);
      return;
    }

    if (Number(inputValue) < minAmount) {
      setError(TEXTS[locale].minimumPrice(formatter.format(minAmount)));
      return;
    }

    setIsLoading(true);
    const success = await onConfirm(inputValue);
    setIsLoading(false);

    if (success) {
      onClose();
    }
  };

  useEffect(() => {
    if (!visible) return;

    setInputValue(defaultValue ?? '');
    setError(null);
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
          disabled={isLoading}
        />

        <View className='flex-1 items-center justify-center px-6'>
          <View className='w-full max-w-[420px] rounded-xl bg-white p-4 shadow-lg'>
            <View className='flex-row justify-between gap-4'>
              <CustomText
                type='h4'
                className='flex-1'
              >
                {title[locale]}
              </CustomText>

              <Pressable
                onPress={onClose}
                hitSlop={16}
                disabled={isLoading}
              >
                <FontAwesomeIcon
                  variant='bold'
                  name='close'
                  size={15}
                  color='cinnabar'
                />
              </Pressable>
            </View>

            <CustomText
              type='body'
              className='text-md mt-2 text-slate-800'
            >
              {description[locale]}
            </CustomText>

            <CustomText
              type='body'
              className='mt-2 text-sm font-bold text-black'
            >
              {extraMessage[locale]}
            </CustomText>

            <View className='mt-4'>
              <CustomText type='body'>
                {`${TEXTS[locale].inputLabel} (€)`}
              </CustomText>

              <TextInput
                value={inputValue}
                onChangeText={handleChange}
                placeholder={TEXTS[locale].inputLabel}
                keyboardType='number-pad'
                inputMode='numeric'
                editable={!isLoading}
                className='mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base'
              />

              <CustomText
                type='body'
                className='mt-1 text-xs text-neutral-500'
              >
                {helperText || TEXTS[locale].noDecimals}
              </CustomText>

              {!!error && (
                <CustomText
                  type='body'
                  className='mt-2 text-xs text-cinnabar'
                >
                  {error}
                </CustomText>
              )}
            </View>

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
