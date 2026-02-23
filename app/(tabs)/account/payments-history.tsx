import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { PaymentCard } from '@/components/payment/PaymentCard';
import { EmptyPaymentHistory } from '@/components/payment/EmptyPaymentHistory';
import { useGetPaymentHistory } from '@/hooks/pages/payment/useGetPaymentHistory';
import { useState, useCallback } from 'react';
import { REQUEST_STATUS } from '@/constants';
import { CustomError } from '@/components/ui/CustomError';
import { useFocusEffect } from 'expo-router';

export default function PaymentsHistoryScreen() {
  const { locale } = useTranslation();
  const {
    data: payments,
    status,
    refetch,
    errorMessage,
    refetch: refetchPaymentHistory,
  } = useGetPaymentHistory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetchPaymentHistory?.();
    }, [refetchPaymentHistory])
  );

  if (
    (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) &&
    !refreshing
  ) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/payments-history'
      />
    );
  }

  // Empty state
  if (payments.length === 0) {
    return (
      <EmptyPaymentHistory
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
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
