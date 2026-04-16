import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { UserBillingInfo } from '@/types/types';

interface BillingCardProps {
  billing: UserBillingInfo;
  onEdit: (billing: UserBillingInfo) => void;
  onDelete: (billing: UserBillingInfo) => void;
  disabled?: boolean;
  isDeleting?: boolean;
}

export function BillingCard({
  billing,
  onEdit,
  onDelete,
  disabled = false,
  isDeleting = false,
}: BillingCardProps) {
  const { t } = useTranslation();

  return (
    <View className='border-gray-200 rounded-3xl border bg-white p-4 shadow-sm'>
      {/* Header con label */}
      <View className='mb-3 flex-row items-start justify-between'>
        <CustomText
          type='h3'
          className='flex-1 font-bold text-black'
        >
          {billing.label}
        </CustomText>
      </View>

      {/* Address details con labels */}
      <View className=''>
        {/* Billing Name */}
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.billingInfo.billingName')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {billing.billingName}
            </CustomText>
          </CustomText>
        </View>

        {/* Billing Address */}
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.billingInfo.billingAddress')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {billing.billingAddress}
            </CustomText>
          </CustomText>
        </View>

        {/* VAT Number */}
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.billingInfo.vatNumber')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {billing.vatNumber}
            </CustomText>
          </CustomText>
        </View>
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.billingInfo.country')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {billing.country}
            </CustomText>
          </CustomText>
        </View>
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.billingInfo.city')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {billing.city}
            </CustomText>
          </CustomText>
        </View>
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.billingInfo.postalCode')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {billing.postalCode}
            </CustomText>
          </CustomText>
        </View>
      </View>

      {/* Botones de acción */}
      <View className='mt-4 flex-row gap-2'>
        <View className='flex-1'>
          <Button
            mode='primary'
            onPress={() => onEdit(billing)}
            disabled={disabled || isDeleting}
          >
            {t('screens.billingInfo.edit')}
          </Button>
        </View>

        <View className='flex-1'>
          <Button
            mode='secondary'
            onPress={() => onDelete(billing)}
            disabled={disabled || isDeleting}
            isLoading={isDeleting}
          >
            {t('screens.billingInfo.delete')}
          </Button>
        </View>
      </View>
    </View>
  );
}
