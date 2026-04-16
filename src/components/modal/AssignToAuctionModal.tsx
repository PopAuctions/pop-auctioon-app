import React, { useEffect, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/fields/SelectField';
import { Loading } from '@/components/ui/Loading';
import { Lang } from '@/types/types';
import { useFetchMyAvailableAuctions } from '@/hooks/components/useFetchMyAvailableAuctions';
import { REQUEST_STATUS } from '@/constants';

interface AssignToAuctionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string, price: string) => Promise<boolean>;
  defaultValue?: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  id: string;
  locale: Lang;
  inputPlaceholder?: { en: string; es: string };
  helperText?: string;
}

const TEXTS = {
  es: {
    auction: 'Selecciona la subasta',
    inputLabel: 'Precio (€)',
    selectLabel: 'Seleccionar subasta',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    noDecimals: 'No se permiten decimales',
  },
  en: {
    auction: 'Select auction',
    inputLabel: 'Price (€)',
    selectLabel: 'Select auction',
    confirm: 'Confirm',
    cancel: 'Cancel',
    noDecimals: 'No decimals allowed',
  },
} as const;

export function AssignToAuctionModal({
  visible,
  onClose,
  onConfirm,
  defaultValue,
  title,
  description,
  id,
  locale,
  inputPlaceholder,
  helperText,
}: AssignToAuctionModalProps) {
  const {
    data: availableAuctions,
    status,
    errorMessage,
  } = useFetchMyAvailableAuctions(visible);
  const [inputValue, setInputValue] = useState(defaultValue ?? '');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const isDataLoading = status === REQUEST_STATUS.loading;
  const enteredDataIsValid = inputValue.length > 0 && selectedAuctionId;

  const handleInputChange = (value: string) => {
    if (/^\d*$/.test(value)) setInputValue(value);
  };

  const handleChange = (value: string | null) => {
    setSelectedAuctionId(value);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const response = await onConfirm(selectedAuctionId ?? '', inputValue);
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
              {status !== REQUEST_STATUS.error && errorMessage && (
                <CustomText
                  type='body'
                  className='mb-2 rounded-md bg-red-100 p-2 text-sm text-red-700'
                >
                  {errorMessage[locale]}
                </CustomText>
              )}

              {isDataLoading ? (
                <View className='my-8'>
                  <Loading locale={locale} />
                </View>
              ) : (
                <>
                  <View className='mb-4'>
                    <CustomText type='body'>
                      {TEXTS[locale].inputLabel}
                    </CustomText>

                    <TextInput
                      value={inputValue}
                      onChangeText={handleInputChange}
                      placeholder={
                        inputPlaceholder ? inputPlaceholder[locale] : ''
                      }
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

                  <View className='mb-4'>
                    <CustomText type='body'>
                      {TEXTS[locale].selectLabel}
                    </CustomText>
                    <SelectField
                      name='selected-auction'
                      value={selectedAuctionId}
                      options={availableAuctions}
                      onChange={handleChange}
                      formField={true}
                      isSearchable={true}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Footer buttons */}
            <View className='mt-4 flex-row gap-3'>
              <Button
                mode='primary'
                className='flex-1'
                onPress={handleConfirm}
                disabled={isLoading || !enteredDataIsValid}
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
