import React, { useEffect, useRef } from 'react';
import { View, Modal, ScrollView } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressSchema, type AddressSchemaType } from '@/utils/schemas';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/fields/SelectField';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useCreateAddress } from '@/hooks/pages/address/useCreateAddress';
import { getErrorMessage } from '@/utils/form-errors';
import { COUNTRIES_MAP } from '@/constants/payment';
import type { CountryObject } from '@/types/types';
import { useToast } from '@/hooks/useToast';

interface AddressFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddressFormModal({
  visible,
  onClose,
  onSuccess,
}: AddressFormModalProps) {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { createAddress, status, errorMessage } = useCreateAddress();
  const isSubmittingRef = useRef(false);

  const countries: readonly CountryObject[] = COUNTRIES_MAP[locale];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressSchemaType>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      nameAddress: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      primaryAddress: false,
    },
  });

  const isSubmitting = status === 'loading';

  // React to status changes only after a submit attempt
  useEffect(() => {
    if (!isSubmittingRef.current) return;

    if (status === 'success') {
      callToast({
        variant: 'success',
        description: {
          en: t('screens.addresses.form.createSuccess'),
          es: t('screens.addresses.form.createSuccess'),
        },
      });
      reset();
      onSuccess();
      onClose();
      isSubmittingRef.current = false;
    } else if (status === 'error' && errorMessage) {
      callToast({
        variant: 'error',
        description: errorMessage,
      });
      isSubmittingRef.current = false;
    }
  }, [status, errorMessage, locale, reset, onSuccess, onClose, callToast, t]);

  const onSubmit = async (data: AddressSchemaType) => {
    isSubmittingRef.current = true;
    await createAddress(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={handleClose}
    >
      <View className='flex-1 bg-white'>
        {/* Header */}
        <View className='border-gray-200 border-b px-4 pb-4 pt-12'>
          <CustomText
            type='h2'
            className='text-center'
          >
            {t('screens.addresses.form.title')}
          </CustomText>
        </View>

        <ScrollView className='flex-1 px-4 py-6'>
          {/* Address Name */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2 font-medium'
            >
              {t('screens.addresses.form.nameAddress')}
            </CustomText>
            <Controller
              control={control}
              name='nameAddress'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.addresses.form.nameAddress')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.nameAddress && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {getErrorMessage(errors.nameAddress.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Address */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2 font-medium'
            >
              {t('screens.addresses.form.address')}
            </CustomText>
            <Controller
              control={control}
              name='address'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.addresses.form.address')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.address && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {getErrorMessage(errors.address.message, locale)}
              </CustomText>
            )}
          </View>

          {/* City */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2 font-medium'
            >
              {t('screens.addresses.form.city')}
            </CustomText>
            <Controller
              control={control}
              name='city'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.addresses.form.city')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.city && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {getErrorMessage(errors.city.message, locale)}
              </CustomText>
            )}
          </View>

          {/* State/Province */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2 font-medium'
            >
              {t('screens.addresses.form.state')}
            </CustomText>
            <Controller
              control={control}
              name='state'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.addresses.form.state')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.state && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {getErrorMessage(errors.state.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Country Selector */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2 font-medium'
            >
              {t('screens.addresses.form.country')}
            </CustomText>
            <Controller
              control={control}
              name='country'
              render={({ field: { onChange, value } }) => (
                <SelectField
                  name='country'
                  value={value}
                  options={countries.map((country) => ({
                    label: country.label,
                    value: country.value,
                  }))}
                  placeholder={t('screens.addresses.form.country')}
                  isDisabled={isSubmitting}
                  isClearable={false}
                  isSearchable={true}
                  formField={true}
                  onChange={onChange}
                />
              )}
            />
            {errors.country && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {getErrorMessage(errors.country.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Postal Code */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2 font-medium'
            >
              {t('screens.addresses.form.postalCode')}
            </CustomText>
            <Controller
              control={control}
              name='postalCode'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.addresses.form.postalCode')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.postalCode && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {getErrorMessage(errors.postalCode.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Primary Address Checkbox */}
          <View className='mb-6 flex-row items-center'>
            <Controller
              control={control}
              name='primaryAddress'
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  value={value}
                  onValueChange={onChange}
                  disabled={isSubmitting}
                  color={value ? '#C1463D' : undefined}
                  className='mr-3'
                />
              )}
            />
            <CustomText
              type='body'
              className='flex-1'
            >
              {t('screens.addresses.form.setPrimary')}
            </CustomText>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View className='border-gray-200 border-t px-4 py-4'>
          <Button
            mode='primary'
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className='mb-3'
          >
            {t('screens.addresses.form.submit')}
          </Button>
          <Button
            mode='secondary'
            onPress={handleClose}
            disabled={isSubmitting}
          >
            {t('screens.addresses.form.cancel')}
          </Button>
        </View>
      </View>
    </Modal>
  );
}
