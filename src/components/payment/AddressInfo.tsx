import React from 'react';
import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Divider } from '@/components/ui/Divider';
import { type User, type UserAddress } from '@/types/types';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export interface PaymentCourierInfo {
  courier?: string | null;
  trackingNumber?: string | null;
}

type Props = {
  userAddress: Partial<UserAddress>;
  user?: Partial<User>;
  paymentCourierInfo: PaymentCourierInfo;
};

export function AddressInfo({ userAddress, user, paymentCourierInfo }: Props) {
  const { t } = useTranslation();
  const paymentsDict = t('screens.payments');

  return (
    <>
      <CustomText
        type='subtitle'
        className='text-center'
      >
        {paymentsDict.shippingInformation}
      </CustomText>

      <View className='mt-3 w-full'>
        {/* User info (2 columns) */}
        <View className='w-full flex-row flex-wrap px-4'>
          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.name}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {user?.name} {user?.lastName}
            </CustomText>
          </View>

          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.email}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {user?.email}
            </CustomText>
          </View>

          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.phone}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {user?.phoneNumber}
            </CustomText>
          </View>

          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.dni}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {user?.dni}
            </CustomText>
          </View>
        </View>

        {/* Address info */}
        <View className='mt-3 w-full flex-row flex-wrap px-4'>
          <View className='mb-2 w-full'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.address}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {userAddress.address}
            </CustomText>
          </View>

          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.country}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {userAddress.country}
            </CustomText>
          </View>

          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.city}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {userAddress.city}
            </CustomText>
          </View>

          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.state}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {userAddress.state}
            </CustomText>
          </View>

          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.postalCode}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {userAddress.postalCode}
            </CustomText>
          </View>
        </View>

        <Divider className='mt-3' />

        {/* Courier info */}
        <View className='mt-3 w-full flex-row flex-wrap px-4'>
          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.shippingCourier}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {paymentCourierInfo?.courier || '-'}
            </CustomText>
          </View>

          <View className='mb-2 w-1/2'>
            <CustomText
              type='body'
              className='text-base font-bold'
            >
              {paymentsDict.trackingNumber}:
            </CustomText>
            <CustomText
              type='body'
              className='text-base'
            >
              {paymentCourierInfo?.trackingNumber || '-'}
            </CustomText>
          </View>
        </View>
      </View>
    </>
  );
}
