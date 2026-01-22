import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { PaidArticleItem } from '@/components/payment/PaidArticleItem';
import { euroFormatter } from '@/utils/euroFormatter';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetSoldArticle } from '@/hooks/pages/article/useGetSoldArticle';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { Divider } from '@/components/ui/Divider';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { AddressInfo } from '@/components/payment/AddressInfo';
import { Button } from '@/components/ui/Button';
import { ShippingForm } from '@/components/payment/ShippingForm';
import { ConfirmModal } from '@/components/modal/ConfirmModal';

export default function SoldArticleScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, status, errorMessage } = useGetSoldArticle(id);
  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);

  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !data?.article) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/payments-history'
      />
    );
  }

  const article = data.article;
  const secondHighestBidUser = data.secondHighestBidUser;
  const payment = article?.payment;
  const userAddress = payment?.UserAddress;
  const user = payment?.User ?? article?.User;
  const dateLang = locale === 'en' ? 'en-US' : 'es-ES';
  const paymentCourierInfo = {
    courier: payment?.shippingCourier,
    trackingNumber: payment?.shippingNumber,
  };

  const paymentDict = t('screens.payment');
  const paymentsDict = t('screens.payments');
  const soldArticles = t('screens.soldArticles');

  return (
    <ScrollView
      className='flex-1 bg-white'
      contentContainerClassName='pb-10'
    >
      {/* Outer container (like mx-auto max-w-7xl) */}
      <View className='w-full items-center px-6 py-5'>
        <View className='w-full max-w-[960px]'>
          <View className='mt-4 w-full gap-5'>
            <View className='w-full'>
              <View className='rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm'>
                <PaidArticleItem
                  article={article.Article}
                  lang={locale}
                  formatter={formatter}
                  texts={{
                    paymentAmount: paymentDict.paid,
                    view: soldArticles.view,
                  }}
                />
              </View>
            </View>

            {/* Right: Payment / Not Paid panel */}
            {payment ? (
              <View className='w-full rounded-2xl border-2 border-cinnabar bg-white px-4 py-3 shadow-sm'>
                <View className='items-center'>
                  <CustomText
                    type='subtitle'
                    className='text-cinnabar'
                  >
                    {paymentDict.paymentDate}{' '}
                    {new Date(payment.createdAt).toLocaleDateString(dateLang, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </CustomText>
                  <CustomText type='subtitle'>
                    {paymentDict.articles}: {payment.articlesPaid.length}
                  </CustomText>
                </View>

                <Divider className='my-3' />

                <View className='gap-2'>
                  <PaymentSummary
                    lang={locale}
                    paymentDict={paymentDict}
                    payment={payment}
                  />
                </View>

                <Divider className='my-3' />

                <View className=''>
                  {userAddress ? (
                    <>
                      <AddressInfo
                        user={user}
                        userAddress={userAddress}
                        paymentCourierInfo={paymentCourierInfo}
                      />

                      <Divider className='my-3' />
                    </>
                  ) : null}

                  <View>
                    <ShippingForm
                      articleId={String(article.Article.id)}
                      paymentId={String(payment.id)}
                      paymentCourierInfo={paymentCourierInfo}
                      paymentsDict={paymentsDict}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View className='w-full rounded-2xl bg-white px-4 py-3'>
                <CustomText
                  type='h2'
                  className='text-center'
                >
                  {soldArticles.notPaid}
                </CustomText>

                {/* Actions: on mobile, stacked cards is better than 3 inline buttons */}
                <View className='mt-4 gap-3'>
                  {/* Replace DeleteButton components later */}
                  <Button mode='primary'>{paymentsDict.notifyAgain}</Button>
                  <Button mode='primary'>
                    {paymentsDict.sendToOnlineStore}
                  </Button>
                  <Button mode='primary'>
                    {paymentsDict.cancelAcquisition}
                  </Button>
                </View>

                <Divider className='my-5' />

                {/* Bidder info */}
                {article.changedBidder ? (
                  <CustomText
                    type='h4'
                    className='mt-3 text-center text-cinnabar'
                  >
                    {paymentsDict.changedBidder}
                  </CustomText>
                ) : (
                  <View className='gap-4'>
                    <View>
                      <CustomText
                        type='subtitle'
                        className='text-center text-xl text-cinnabar'
                      >
                        {paymentsDict.userWon}
                      </CustomText>
                      <View className='mt-2 items-center'>
                        <CustomText
                          type='h4'
                          className='text-center'
                        >
                          {user?.username}
                        </CustomText>
                        <CustomText
                          type='h4'
                          className='text-center'
                        >
                          {user?.name} {user?.lastName}
                        </CustomText>
                      </View>
                    </View>

                    {secondHighestBidUser ? (
                      <View className='gap-3'>
                        <CustomText
                          type='subtitle'
                          className='text-center text-xl text-cinnabar'
                        >
                          {paymentsDict.secondUser}
                        </CustomText>

                        <View className='items-center'>
                          <CustomText
                            type='h4'
                            className='text-center'
                          >
                            {secondHighestBidUser.username}
                          </CustomText>
                          <CustomText
                            type='h4'
                            className='text-center'
                          >
                            {secondHighestBidUser.name}{' '}
                            {secondHighestBidUser.lastName}
                          </CustomText>
                        </View>

                        <View className='items-center'>
                          <ConfirmModal
                            mode='primary'
                            // onConfirm={async () => {
                            //   await handleAcceptOffer(offer.id);
                            // }}
                            onConfirm={() => {}}
                            // isDisabled={isLoading}
                            title={{
                              es: 'Otorgar a segundo mayor postor',
                              en: 'Grant to second highest bidder',
                            }}
                            description={{
                              es: '¿Está seguro de que desea otorgar el artículo al segundo mayor postor?',
                              en: 'Are you sure you want to grant the article to the second highest bidder?',
                            }}
                            importantMessage={{
                              es: 'No podrás revertir esta acción.',
                              en: 'You will not be able to revert this action.',
                            }}
                            locale={locale}
                          >
                            {paymentsDict.grantToSecondUser}
                          </ConfirmModal>
                        </View>
                      </View>
                    ) : (
                      <CustomText
                        type='h4'
                        className='mt-3 text-center text-cinnabar'
                      >
                        {paymentsDict.justOneBidder}
                      </CustomText>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
