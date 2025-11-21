import React, { useMemo } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { Divider } from '@/components/ui/Divider';
import { Button } from '@/components/ui/Button';
import { CustomError } from '@/components/ui/CustomError';
import { euroFormatter } from '@/utils/euroFormatter';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { useGetPayment } from '@/hooks/pages/payment/useGetPayment';
import { PaidArticleItem } from '@/components/payment/PaidArticleItem';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { AddressInfo } from '@/components/payment/AddressInfo';
import { UserInvoice } from '@/components/invoices/UserInvoice';
import { useGetBilling } from '@/hooks/pages/billing/useBilling';
import { useGetUserInvoice } from '@/hooks/components/useUserInvoice';

export default function PaymentScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: paymentData,
    status,
    errorMessage,
  } = useGetPayment({ paymentId: id });
  const { data: billingData, refetch: refetchBillingInfo } = useGetBilling();
  const { data: invoiceData, refetch: refetchUserInvoice } = useGetUserInvoice({
    paymentID: id,
  });

  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);

  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return <Loading locale={locale} />;
  }

  if (
    status === REQUEST_STATUS.error ||
    !paymentData ||
    !paymentData.userAddress
  ) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/payments-history'
      />
    );
  }

  const profileDic = t('screens.editProfile');
  const paymentDict = t('screens.payment');
  const billingDict = t('screens.billingInfo');
  const soldArticlesDict = t('screens.soldArticles');
  const auction = paymentData.auction;

  const paymentCourierInfo = {
    courier: paymentData.shippingCourier,
    trackingNumber: paymentData.shippingNumber,
  };
  const paymentDate = new Date(paymentData.createdAt);
  const userAddress = paymentData.userAddress;
  const user = paymentData.user;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 24 }}
      className='flex-1 px-4 pt-8'
    >
      {/* Title */}
      <CustomText
        type='h1'
        className='text-center text-cinnabar'
      >
        {auction?.title ?? profileDic.onlineStore}
      </CustomText>

      {/* Main section */}
      <View className='w-full flex-col gap-5'>
        {/* Articles list */}
        <View className='w-full'>
          <View className='flex w-full flex-col gap-5'>
            {paymentData.articles.map((article: any) => (
              <PaidArticleItem
                key={article.id}
                article={article}
                lang={locale}
                formatter={formatter}
                texts={{
                  paymentAmount: paymentDict.paid,
                  view: soldArticlesDict.view,
                }}
              />
            ))}
          </View>
        </View>

        {/* Summary / aside */}
        <View className='w-full rounded-2xl border-2 border-cinnabar px-4 py-3'>
          <View className='items-center'>
            <CustomText
              type='subtitle'
              className='text-center text-cinnabar'
            >
              {paymentDict.paymentDate}{' '}
              {paymentDate.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CustomText>
            <CustomText type='subtitle'>
              {paymentDict.articles}: {paymentData.articles.length}
            </CustomText>
          </View>

          <Divider />

          <View className='my-2'>
            <PaymentSummary
              lang={locale}
              paymentDict={paymentDict}
              payment={paymentData}
            />

            <Divider className='my-2' />

            <AddressInfo
              user={user}
              userAddress={userAddress}
              paymentCourierInfo={paymentCourierInfo}
            />
          </View>

          <Divider className='my-2' />

          <View className='flex w-full flex-col items-center justify-center'>
            {/* Download Section */}
            <View className='w-full'>
              <View className='flex w-full flex-col gap-4'>
                <View className='flex flex-col'>
                  <CustomText
                    type='subtitle'
                    className='text-lg'
                  >
                    {paymentDict.invoice}
                  </CustomText>
                  <UserInvoice
                    lang={locale}
                    texts={{
                      view: paymentDict.view,
                      generate: paymentDict.generate,
                      billing: paymentDict.billingInformation,
                    }}
                    billingDict={billingDict}
                    billingData={billingData}
                    paymentId={paymentData.id}
                    invoiceData={invoiceData}
                    refetchBillingInfo={refetchBillingInfo}
                    refetchUserInvoice={refetchUserInvoice}
                  />
                </View>
                {paymentData.receiptUrl && (
                  <View className='flex flex-col'>
                    <CustomText
                      type='subtitle'
                      className='text-lg'
                    >
                      {paymentDict.receipt}
                    </CustomText>
                    <Button
                      mode='primary'
                      size='small'
                      onPress={() => {
                        Linking.openURL(paymentData.receiptUrl as string);
                      }}
                    >
                      {paymentDict.view}
                    </Button>
                  </View>
                )}
              </View>

              <View className='mt-2 text-center'>
                <CustomText
                  type='body'
                  className='text-sm'
                >
                  {paymentDict.help}
                </CustomText>
                <Link
                  href='mailto:support@popauctioon.com'
                  className='text-cinnabar underline'
                >
                  support@popauctioon.com
                </Link>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
