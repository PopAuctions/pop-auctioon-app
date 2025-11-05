import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressSchema, type AddressSchemaType } from '@/utils/schemas';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { getErrorMessage } from '@/utils/form-errors';
import { COUNTRIES_MAP, type CountryObject } from '@/constants/countries';

interface AddressFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addressToEdit?: (AddressSchemaType & { id?: string }) | null;
}

export function AddressFormModal({
  visible,
  onClose,
  onSuccess,
  addressToEdit,
}: AddressFormModalProps) {
  const { t, locale } = useTranslation();
  const { securePost } = useSecureApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const countries: CountryObject[] = COUNTRIES_MAP[locale];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AddressSchemaType>({
    resolver: zodResolver(AddressSchema),
    defaultValues: addressToEdit || {
      nameAddress: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      primaryAddress: false,
    },
  });

  const selectedCountry = watch('country');
  const selectedCountryLabel =
    countries.find((c) => c.value === selectedCountry)?.label ||
    t('screens.addresses.form.country');

  const onSubmit = async (data: AddressSchemaType) => {
    setIsSubmitting(true);

    try {
      const response = await securePost(
        SECURE_ENDPOINTS.USER.CREATE_ADDRESS,
        data
      );

      if (response.error) {
        Alert.alert(
          t('commonActions.error'),
          response.error || t('screens.addresses.error')
        );
        return;
      }

      const successMessage =
        typeof response.data === 'object' && response.data !== null
          ? (response.data as { success?: string }).success
          : undefined;

      Alert.alert(
        t('commonActions.ok'),
        successMessage || t('screens.addresses.success')
      );

      reset();
      onSuccess();
      onClose();
    } catch (_error) {
      Alert.alert(t('commonActions.error'), t('screens.addresses.error'));
    } finally {
      setIsSubmitting(false);
    }
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
                <>
                  <TouchableOpacity
                    className='border-gray-300 min-h-[50px] justify-center rounded-lg border bg-white px-4 py-3'
                    onPress={() => setShowCountryPicker(true)}
                    disabled={isSubmitting}
                  >
                    <CustomText
                      type='body'
                      className={!value ? 'text-gray-400' : ''}
                    >
                      {selectedCountryLabel}
                    </CustomText>
                  </TouchableOpacity>

                  {/* Country Picker Modal */}
                  <Modal
                    visible={showCountryPicker}
                    animationType='slide'
                    presentationStyle='pageSheet'
                    onRequestClose={() => setShowCountryPicker(false)}
                  >
                    <View className='flex-1 bg-white'>
                      <View className='border-gray-200 border-b px-4 pb-4 pt-12'>
                        <CustomText
                          type='h3'
                          className='text-center'
                        >
                          {t('screens.addresses.form.country')}
                        </CustomText>
                      </View>
                      <ScrollView className='flex-1'>
                        {countries.map((country) => (
                          <TouchableOpacity
                            key={country.value}
                            className='border-gray-100 border-b px-6 py-4'
                            onPress={() => {
                              onChange(country.value);
                              setShowCountryPicker(false);
                            }}
                          >
                            <CustomText
                              type='body'
                              className={
                                value === country.value
                                  ? 'font-bold text-cinnabar'
                                  : ''
                              }
                            >
                              {country.label}
                            </CustomText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <View className='border-gray-200 border-t px-4 py-4'>
                        <Button
                          mode='secondary'
                          onPress={() => setShowCountryPicker(false)}
                        >
                          {t('commonActions.cancel')}
                        </Button>
                      </View>
                    </View>
                  </Modal>
                </>
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
          <View className='mb-6'>
            <Controller
              control={control}
              name='primaryAddress'
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  className='flex-row items-center'
                  onPress={() => onChange(!value)}
                  disabled={isSubmitting}
                >
                  <View
                    className={`mr-3 h-6 w-6 items-center justify-center rounded border-2 ${
                      value ? 'border-cinnabar bg-cinnabar' : 'border-gray-400'
                    }`}
                  >
                    {value && (
                      <CustomText
                        type='body'
                        className='text-white'
                      >
                        ✓
                      </CustomText>
                    )}
                  </View>
                  <CustomText
                    type='body'
                    className='flex-1'
                  >
                    {t('screens.addresses.form.setPrimary')}
                  </CustomText>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View className='border-gray-200 border-t px-4 py-4'>
          <Button
            mode='primary'
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
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
