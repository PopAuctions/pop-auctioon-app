import React from 'react';
import { View } from 'react-native';

import { Divider } from '@/components/ui/Divider';
import { CustomText } from '@/components/ui/CustomText';
import { euroFormatter } from '@/utils/euroFormatter';
import { Lang, UserPayment } from '@/types/types';
import { type Translations } from '@/i18n';

type Props = {
  lang: Lang;
  paymentDict: Translations['es']['screens']['payment'];
  payment: UserPayment;
};

export function PaymentSummary({ lang, paymentDict, payment }: Props) {
  const formatter = euroFormatter(lang, 2);

  return (
    <>
      {/* Subtotal */}
      <View className='flex flex-row items-center justify-between px-2'>
        <CustomText
          type='h4'
          className='text-base'
        >
          {paymentDict.subtotal}
        </CustomText>
        <CustomText
          type='h4'
          className='text-base'
        >
          {formatter.format(payment.articlesAmount ?? 0)}
        </CustomText>
      </View>

      {/* Commission */}
      <View className='flex flex-row items-center justify-between px-2'>
        <CustomText
          type='h4'
          className='text-base'
        >
          {paymentDict.commission} {paymentDict.commission2}
        </CustomText>
        <CustomText
          type='h4'
          className='text-base'
        >
          {formatter.format(payment.commissionAmount ?? 0)}
        </CustomText>
      </View>

      {/* Shipping */}
      <View
        className={`flex flex-row items-center justify-between px-2 ${payment.discountAmount ? '' : 'mb-2'}`}
      >
        <CustomText
          type='h4'
          className='text-base'
        >
          {paymentDict.shipping}
        </CustomText>
        <CustomText
          type='h4'
          className='text-base'
        >
          {formatter.format(payment.shippingAmount ?? 0)}
        </CustomText>
      </View>

      {/* Discount (optional) */}
      {payment.discountAmount ? (
        <View className='mb-2 flex flex-row items-center justify-between px-2'>
          <CustomText
            type='h4'
            className='text-base'
          >
            {paymentDict.discount}
          </CustomText>
          <CustomText
            type='h4'
            className='text-base'
          >
            -{formatter.format(payment.discountAmount ?? 0)}
          </CustomText>
        </View>
      ) : null}

      <Divider />

      {/* Total */}
      <View className='mt-2 flex flex-row items-center justify-between px-2 font-bold'>
        <CustomText
          type='h4'
          className='text-base'
        >
          {paymentDict.total}
        </CustomText>
        <CustomText
          type='h4'
          className='text-base'
        >
          {formatter.format(payment.totalAmount ?? 0)}
        </CustomText>
      </View>
    </>
  );
}
