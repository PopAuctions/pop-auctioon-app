import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/useToast';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/form-errors';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Button } from '@/components/ui/Button';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { LangMap } from '@/types/types';

interface PaymentCourierInfo {
  courier?: string | null;
  trackingNumber?: string | null;
}

const ShippingInfoSchema = z.object({
  shippingCourier: z.string(),
  shippingNumber: z.string(),
});

type ShippingInfoSchemaType = z.infer<typeof ShippingInfoSchema>;

type ShippingFormProps = {
  articleId: string;
  paymentId: string;
  paymentCourierInfo: PaymentCourierInfo;
  paymentsDict: {
    shippingCourier: string;
    trackingNumber: string;
    shippingInformation: string;
    submit: string;
    cancel: string;
    save: string;
    updateCourier: string;
    emailWarning: string;
  };
};

export function ShippingForm({
  articleId,
  paymentId,
  paymentCourierInfo,
  paymentsDict,
}: ShippingFormProps) {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { securePost } = useSecureApi();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = useMemo(
    () => ({
      shippingCourier: paymentCourierInfo?.courier ?? '',
      shippingNumber: paymentCourierInfo?.trackingNumber ?? '',
    }),
    [paymentCourierInfo?.courier, paymentCourierInfo?.trackingNumber]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingInfoSchemaType>({
    resolver: zodResolver(ShippingInfoSchema),
    defaultValues,
  });

  const onSubmit = async (values: ShippingInfoSchemaType) => {
    try {
      setIsLoading(true);

      const params = {
        paymentId,
        shippingCourier: values.shippingCourier ?? '',
        shippingNumber: values.shippingNumber ?? '',
      };

      const response = await securePost<LangMap | null>({
        endpoint: SECURE_ENDPOINTS.USER.UPDATE_SHIPPING_INFORMATION(articleId),
        data: params,
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }

      callToast({
        variant: 'success',
        description: response?.data ?? {
          es: 'Información de envío actualizada correctamente.',
          en: 'Shipping information updated successfully.',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <CustomText
        type='subtitle'
        className='text-center'
      >
        {paymentsDict.updateCourier}
      </CustomText>

      {/* Inputs container (mobile stack) */}
      <View className=''>
        {/* shippingCourier */}
        <View className='mb-4'>
          <CustomText
            type='body'
            className='mb-2'
          >
            {t('screens.payments.shippingCourier')}
          </CustomText>
          <Controller
            control={control}
            name='shippingCourier'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={
                  value === null || value === undefined ? '' : String(value)
                }
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('screens.payments.shippingCourier')}
                editable={!isLoading}
              />
            )}
          />
          {errors.shippingCourier && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {getErrorMessage(errors.shippingCourier.message, locale)}
            </CustomText>
          )}
        </View>

        {/* shippingNumber */}
        <View className='mb-4'>
          <CustomText
            type='body'
            className='mb-2'
          >
            {t('screens.payments.trackingNumber')}
          </CustomText>
          <Controller
            control={control}
            name='shippingNumber'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={
                  value === null || value === undefined ? '' : String(value)
                }
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('screens.payments.trackingNumber')}
                editable={!isLoading}
              />
            )}
          />
          {errors.shippingNumber && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {getErrorMessage(errors.shippingNumber.message, locale)}
            </CustomText>
          )}
        </View>

        {/* Warning */}
        <CustomText
          type='bodysmall'
          className='text-sm text-gray'
        >
          {t('screens.payments.emailWarning')}
        </CustomText>

        {/* Footer */}
        <View className='mx-2 mt-4'>
          <Button
            mode='primary'
            size='small'
            className='w-full'
            isLoading={isLoading}
            disabled={isLoading}
            onPress={handleSubmit(onSubmit)}
          >
            {paymentsDict.save}
          </Button>
        </View>
      </View>
    </View>
  );
}
