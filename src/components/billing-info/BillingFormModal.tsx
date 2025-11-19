import { useEffect, useRef } from 'react';
import { View, ScrollView, Modal } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import {
  useCreateBilling,
  useUpdateBilling,
} from '@/hooks/pages/billing/useBilling';
import {
  BillingSchema,
  type BillingSchemaType,
} from '@/utils/schemas/billingSchemas';
import { useToast } from '@/hooks/useToast';

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
  const { callToast } = useToast(locale);
  const { createBilling, status: createStatus } = useCreateBilling();
  const { updateBilling, status: updateStatus } = useUpdateBilling();
  const isSubmittingRef = useRef(false);

  const isEditMode = billingToEdit?.id !== undefined;
  const currentStatus = isEditMode ? updateStatus : createStatus;
  const isSubmitting = currentStatus === 'loading';

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

  // Handle success/error from hooks
  useEffect(() => {
    if (!visible) return;

    if (currentStatus === 'success' && isSubmittingRef.current) {
      console.log(`✅ ${isEditMode ? 'UPDATED' : 'CREATED'} BILLING`);
      callToast({
        variant: 'success',
        description: {
          en: t(
            isEditMode
              ? 'screens.billingInfo.updateSuccess'
              : 'screens.billingInfo.createSuccess'
          ),
          es: t(
            isEditMode
              ? 'screens.billingInfo.updateSuccess'
              : 'screens.billingInfo.createSuccess'
          ),
        },
      });
      isSubmittingRef.current = false;
      reset();
      onSuccess();
    } else if (currentStatus === 'error' && isSubmittingRef.current) {
      console.log('❌ ERROR_SAVE_BILLING');
      // Error handling is done in the parent screen (billing-info.tsx)
      isSubmittingRef.current = false;
    }
  }, [currentStatus, visible, isEditMode, reset, onSuccess, callToast, t]);

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
    isSubmittingRef.current = true;

    try {
      const isEditMode = billingToEdit?.id !== undefined;

      console.log(
        `💾 ${isEditMode ? 'Actualizando' : 'Creando'} billing info:`,
        data
      );

      if (isEditMode && billingToEdit.id) {
        // UPDATE - Use PATCH
        await updateBilling(billingToEdit.id, data);
      } else {
        // CREATE - Use POST
        await createBilling(data);
      }
    } catch (error) {
      console.error('❌ ERROR_SAVE_BILLING_CATCH:', error);
      // Error handling is done in the parent screen (billing-info.tsx)
      isSubmittingRef.current = false;
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
                  editable={!isSubmitting}
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
                  editable={!isSubmitting}
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
                  editable={!isSubmitting}
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
                  editable={!isSubmitting}
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
