import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { PaymentCard } from '@/components/payment-history/PaymentCard';
import { useGetPaymentHistory } from '@/hooks/pages/payment/useGetPaymentHistory';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export default function PaymentsHistoryScreen() {
  const { t, locale } = useTranslation();
  const { data: payments, status, refetch } = useGetPaymentHistory();
  const [refreshing, setRefreshing] = useState(false);

  // Refrescar cuando el screen vuelva al foco
  /* useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  ); */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Loading state
  if (status === 'loading' || status === 'idle') {
    return <Loading locale={locale} />;
  }

  // Error state (show error but allow retry)
  if (status === 'error') {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['bottom']}
      >
        <View className='flex-1 items-center justify-center p-6'>
          <CustomText
            type='h3'
            className='mb-4 text-center text-red-500'
          >
            {t('commonErrors.generic')}
          </CustomText>
          <CustomText
            type='body'
            className='text-gray-600 text-center'
          >
            {t('commonErrors.defaultMessage')}
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (payments.length === 0) {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['bottom']}
      >
        <ScrollView
          contentContainerClassName='flex-1 items-center justify-center px-6'
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <CustomText
            type='h1'
            className='mb-2 text-center text-cinnabar'
          >
            {t('screens.paymentsHistory.title')}
          </CustomText>
          <CustomText
            type='body'
            className='text-gray-600 mb-8 text-center'
          >
            {t('screens.paymentsHistory.noPaymentsYet')}
          </CustomText>
          <CustomText
            type='body'
            className='text-gray-500 text-center'
          >
            {t('screens.paymentsHistory.noPaymentsSubtitle')}
          </CustomText>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        className='flex-1'
        contentContainerClassName='px-6 py-6'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <CustomText
          type='h1'
          className='mb-2 text-center text-cinnabar'
        >
          {t('screens.paymentsHistory.title')}
        </CustomText>
        <CustomText
          type='body'
          className='text-gray-600 mb-6 text-center'
        >
          {t('screens.paymentsHistory.subtitle')}
        </CustomText>

        {/* Payment cards list */}
        <View className='mt-4'>
          {payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
