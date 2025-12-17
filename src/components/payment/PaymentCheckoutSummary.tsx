/**
 * PaymentCheckoutSummary - Resumen de pago en checkout con breakdown de costos
 * Incluye:
 * - Código de descuento (input + botón aplicar/quitar)
 * - Subtotal, comisión, envío, descuento
 * - Total con formato de euros
 */

import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { euroFormatter } from '@/utils/euroFormatter';

interface PaymentDetails {
  subtotal: number;
  commission: number;
  shipping: number;
  discount: number;
  total: number;
}

interface AppliedDiscount {
  code: string;
  amount: number;
}

interface PaymentCheckoutSummaryProps {
  paymentDetails: PaymentDetails;
  appliedDiscount: AppliedDiscount | null;
  discountCode: string;
  onDiscountCodeChange: (code: string) => void;
  onApplyDiscount: () => void;
  onRemoveDiscount: () => void;
  isValidatingDiscount: boolean;
}

export function PaymentCheckoutSummary({
  paymentDetails,
  appliedDiscount,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  onRemoveDiscount,
  isValidatingDiscount,
}: PaymentCheckoutSummaryProps) {
  const { t, locale } = useTranslation();
  const paymentTranslations = t('screens.payment');
  const formatter = euroFormatter(locale, 2);

  return (
    <View className='mb-6'>
      <CustomText
        type='h3'
        className='mb-3 text-cinnabar'
      >
        {paymentTranslations.summary}
      </CustomText>

      <View className='bg-gray-50 rounded-lg p-4'>
        {/* Código de descuento */}
        <View className='mb-4'>
          <CustomText
            type='body'
            className='text-gray-700 mb-2 font-medium'
          >
            {paymentTranslations.couponCode}
          </CustomText>

          {!appliedDiscount ? (
            <View
              key='discount-input'
              className='flex-row items-center gap-2'
            >
              <View className='flex-1'>
                <Input
                  placeholder={paymentTranslations.couponCode}
                  value={discountCode}
                  onChangeText={onDiscountCodeChange}
                  autoCapitalize='characters'
                  editable={!isValidatingDiscount}
                />
              </View>
              <Button
                mode='secondary'
                size='small'
                onPress={onApplyDiscount}
                disabled={!discountCode.trim() || isValidatingDiscount}
                isLoading={isValidatingDiscount}
              >
                {paymentTranslations.applyCoupon}
              </Button>
            </View>
          ) : (
            <View
              key='discount-applied'
              className='relative'
            >
              <Input
                value={appliedDiscount.code}
                editable={false}
                className='pr-10'
              />
              <Button
                mode='empty'
                size='small'
                onPress={onRemoveDiscount}
                className='absolute right-2 top-1/2 -translate-y-1/2'
              >
                <CustomText
                  type='body'
                  className='text-gray-600'
                >
                  x
                </CustomText>
              </Button>
            </View>
          )}
        </View>

        {/* Subtotal */}
        <View className='mb-2 flex-row justify-between'>
          <CustomText
            type='body'
            className='text-gray-600'
          >
            {paymentTranslations.subtotal}:
          </CustomText>
          <CustomText
            type='body'
            className='font-medium'
          >
            {formatter.format(paymentDetails.subtotal)}
          </CustomText>
        </View>

        {/* Comisión */}
        <View className='mb-2 flex-row justify-between'>
          <CustomText
            type='body'
            className='text-gray-600'
          >
            {paymentTranslations.commission} {paymentTranslations.commission2}:
          </CustomText>
          <CustomText
            type='body'
            className='font-medium'
          >
            {formatter.format(paymentDetails.commission)}
          </CustomText>
        </View>

        {/* Envío */}
        <View className='mb-2 flex-row justify-between'>
          <CustomText
            type='body'
            className='text-gray-600'
          >
            {paymentTranslations.shipping}:
          </CustomText>
          <CustomText
            type='body'
            className='font-medium'
          >
            {formatter.format(paymentDetails.shipping)}
          </CustomText>
        </View>

        {/* Descuento (si aplica) */}
        {appliedDiscount && (
          <View className='mb-2 flex-row justify-between'>
            <CustomText
              type='body'
              className='text-green-600'
            >
              {paymentTranslations.discount}:
            </CustomText>
            <CustomText
              type='body'
              className='font-medium text-green-600'
            >
              -{formatter.format(paymentDetails.discount)}
            </CustomText>
          </View>
        )}

        {/* Línea divisoria */}
        <View className='bg-gray-300 my-3 h-px' />

        {/* Total */}
        <View className='flex-row justify-between'>
          <CustomText
            type='h4'
            className='font-bold text-cinnabar'
          >
            {paymentTranslations.total}:
          </CustomText>
          <CustomText
            type='h4'
            className='font-bold text-cinnabar'
          >
            {formatter.format(paymentDetails.total)}
          </CustomText>
        </View>
      </View>
    </View>
  );
}
