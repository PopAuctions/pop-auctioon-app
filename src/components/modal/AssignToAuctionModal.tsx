import React, { useEffect, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/fields/SelectField';
import { Loading } from '@/components/ui/Loading';
import { useFetchMyAvailableAuctions } from '@/hooks/components/useFetchMyAvailableAuctions';
import { REQUEST_STATUS } from '@/constants';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface AssignToAuctionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string, price: string) => Promise<boolean>;
  defaultValue?: string;
  title: string;
  description: string;
  id: string;
  inputPlaceholder?: string;
  helperText?: string;
}

export function AssignToAuctionModal({
  visible,
  onClose,
  onConfirm,
  defaultValue,
  title,
  description,
  id,
  inputPlaceholder,
  helperText,
}: AssignToAuctionModalProps) {
  const { locale, t } = useTranslation();
  const texts = t('components.modals.onlineStoreArticle');
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
                    <CustomText type='body'>{texts.priceInputLabel}</CustomText>

                    <TextInput
                      value={inputValue}
                      onChangeText={handleInputChange}
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

                  <View className='mb-4'>
                    <CustomText type='body'>
                      {texts.auctionSelectLabel}
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
