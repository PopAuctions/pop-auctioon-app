import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { UserAddress } from '@/types/types';

interface AddressCardProps {
  address: UserAddress;
  countryLabel: string;
}

export function AddressCard({ address, countryLabel }: AddressCardProps) {
  const { t } = useTranslation();

  return (
    <View className='border-gray-200 rounded-3xl border bg-white p-4 shadow-sm'>
      {/* Header con label y badge primary */}
      <View className='mb-3 flex-row items-start justify-between'>
        <CustomText
          type='h3'
          className='flex-1 font-bold text-black'
        >
          {address.nameAddress}
        </CustomText>
        {address.primaryAddress && (
          <CustomText
            type='bold'
            className='text-2xl text-black'
          >
            {t('screens.addresses.primary')}
          </CustomText>
        )}
      </View>

      {/* Address details con labels inline */}
      <View className='gap-2'>
        {/* Address */}
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.addresses.address')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {address.address}
            </CustomText>
          </CustomText>
        </View>

        {/* City & State */}
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.addresses.city')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {address.city}, {address.state}
            </CustomText>
          </CustomText>
        </View>

        {/* Country */}
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.addresses.country')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {countryLabel}
            </CustomText>
          </CustomText>
        </View>

        {/* Postal Code */}
        <View>
          <CustomText
            type='body'
            className='font-bold text-black'
          >
            {t('screens.addresses.postalCode')}:{' '}
            <CustomText
              type='body'
              className='font-normal'
            >
              {address.postalCode}
            </CustomText>
          </CustomText>
        </View>
      </View>
    </View>
  );
}
