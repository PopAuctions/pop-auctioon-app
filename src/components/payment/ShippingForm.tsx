import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/useToast';
import { CustomText } from '../ui/CustomText';
import { Input } from '../ui/Input';
import { getErrorMessage } from '@/utils/form-errors';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Button } from '../ui/Button';

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
  paymentId,
  paymentCourierInfo,
  paymentsDict,
}: ShippingFormProps) {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
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

      // const { error, success } = await updateShippingInfo({
      //   paymentId,
      //   shippingCourier: values.shippingCourier ?? '',
      //   shippingNumber: values.shippingNumber ?? '',
      // });

      // if (error) {
      //   callToast({ variant: 'error', description: error });
      //   return;
      // }

      // callToast({ variant: 'success', description: success });
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
                keyboardType='number-pad'
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
                keyboardType='number-pad'
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
