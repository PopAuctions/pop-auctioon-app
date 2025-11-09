import { useState, useEffect } from 'react';
import { View, ScrollView, Modal } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import {
  BillingSchema,
  type BillingSchemaType,
} from '@/utils/schemas/billingSchemas';

interface BillingFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  billingToEdit?: (BillingSchemaType & { id?: string }) | null;
}

export function BillingFormModal({
  visible,
  onClose,
  onSuccess,
  billingToEdit,
}: BillingFormModalProps) {
  const { t, locale } = useTranslation();
  const { securePost, securePatch } = useSecureApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BillingSchemaType>({
    resolver: zodResolver(BillingSchema),
    defaultValues: {
      label: '',
      billingName: '',
      billingAddress: '',
      vatNumber: '',
    },
  });

  // Populate form when billingToEdit changes
  useEffect(() => {
    if (billingToEdit) {
      console.log('📝 Populando formulario con:', billingToEdit);
      reset({
        label: billingToEdit.label,
        billingName: billingToEdit.billingName,
        billingAddress: billingToEdit.billingAddress,
        vatNumber: billingToEdit.vatNumber,
      });
    } else {
      // Reset to empty when creating new
      reset({
        label: '',
        billingName: '',
        billingAddress: '',
        vatNumber: '',
      });
    }
  }, [billingToEdit, reset]);

  const onSubmit = async (data: BillingSchemaType) => {
    setIsSubmitting(true);

    try {
      const isEditMode = billingToEdit?.id !== undefined;

      console.log(
        `💾 ${isEditMode ? 'Actualizando' : 'Creando'} billing info:`,
        data
      );

      let response;

      if (isEditMode && billingToEdit.id) {
        // UPDATE - Use PATCH
        response = await securePatch({
          endpoint: SECURE_ENDPOINTS.USER.BILLING_BY_ID(billingToEdit.id),
          data: {
            label: data.label,
            billingName: data.billingName,
            billingAddress: data.billingAddress,
            vatNumber: data.vatNumber,
          },
        });
      } else {
        // CREATE - Use POST
        response = await securePost({
          endpoint: SECURE_ENDPOINTS.USER.BILLING,
          data: {
            label: data.label,
            billingName: data.billingName,
            billingAddress: data.billingAddress,
            vatNumber: data.vatNumber,
          },
        });
      }

      if (response.error) {
        console.error('❌ ERROR_SAVE_BILLING:', response.error);
        // TODO: Show toast with response.error[locale]
        return;
      }

      console.log(
        `✅ ${isEditMode ? 'UPDATED' : 'CREATED'} BILLING:`,
        response.data
      );
      // TODO: Show success toast

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ ERROR_SAVE_BILLING_CATCH:', error);
      // TODO: Mostrar toast con error
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
            {t('screens.billingInfo.formTitle')}
          </CustomText>
        </View>

        <ScrollView className='flex-1 px-4 py-6'>
          {/* Etiqueta de identificación */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.billingInfo.label')} *
            </CustomText>
            <Controller
              control={control}
              name='label'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.billingInfo.labelPlaceholder')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize='words'
                />
              )}
            />
            {errors.label && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {JSON.parse(errors.label.message || '{}')[locale] ||
                  errors.label.message}
              </CustomText>
            )}
          </View>

          {/* Nombre o razón social */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.billingInfo.billingName')} *
            </CustomText>
            <Controller
              control={control}
              name='billingName'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.billingInfo.billingNamePlaceholder')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize='words'
                />
              )}
            />
            {errors.billingName && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {JSON.parse(errors.billingName.message || '{}')[locale] ||
                  errors.billingName.message}
              </CustomText>
            )}
          </View>

          {/* Dirección de facturación */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.billingInfo.billingAddress')} *
            </CustomText>
            <Controller
              control={control}
              name='billingAddress'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t(
                    'screens.billingInfo.billingAddressPlaceholder'
                  )}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize='words'
                  multiline
                  numberOfLines={3}
                />
              )}
            />
            {errors.billingAddress && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {JSON.parse(errors.billingAddress.message || '{}')[locale] ||
                  errors.billingAddress.message}
              </CustomText>
            )}
          </View>

          {/* Número de identificación fiscal */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.billingInfo.vatNumber')} *
            </CustomText>
            <Controller
              control={control}
              name='vatNumber'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.billingInfo.vatNumberPlaceholder')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize='characters'
                />
              )}
            />
            {errors.vatNumber && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {JSON.parse(errors.vatNumber.message || '{}')[locale] ||
                  errors.vatNumber.message}
              </CustomText>
            )}
          </View>
        </ScrollView>

        {/* Footer con botones */}
        <View className='border-gray-200 border-t px-4 py-4'>
          <Button
            mode='primary'
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {t('commonActions.save')}
          </Button>
          <Button
            mode='secondary'
            onPress={handleClose}
            disabled={isSubmitting}
            className='mt-2'
          >
            {t('commonActions.cancel')}
          </Button>
        </View>
      </View>
    </Modal>
  );
}
