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
  title: string;
  description: string;
  extraMessage: string;
  defaultValue?: string;
  minAmount: number;
  helperText?: string;
};

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
  const { locale, t } = useTranslation();
  const texts = t('components.modals.automaticBid');
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
      setError(texts.missingValue);
      return;
    }

    const numericInput = Number(inputValue);

    if (numericInput < minAmount) {
      setError(
        t('components.modals.automaticBid.minimumPrice', {
          amount: formatter.format(minAmount),
        })
      );
      return;
    }

    if (numericInput % 10 !== 0) {
      setError(texts.multipleOfTen);
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
                {title}
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
              {description}
            </CustomText>

            <CustomText
              type='body'
              className='mt-2 text-sm font-bold text-black'
            >
              {extraMessage}
            </CustomText>

            <View className='mt-4'>
              <CustomText type='body'>{`${texts.inputLabel} (€)`}</CustomText>

              <TextInput
                value={inputValue}
                onChangeText={handleChange}
                placeholder={texts.inputLabel}
                keyboardType='number-pad'
                inputMode='numeric'
                editable={!isLoading}
                className='mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base'
              />

              <CustomText
                type='body'
                className='mt-1 text-xs text-neutral-500'
              >
                {helperText || texts.noDecimals}
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
