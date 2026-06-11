import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import {
  clearPaymentResultContext,
  getPaymentResultContext,
  type PaymentResultContext,
} from '@/utils/payments/payment-result-context';

export default function PaymentResultScreen() {
  const { status, order } = useLocalSearchParams<{
    status?: string;
    order?: string;
  }>();
  const router = useRouter();
  const { navigateWithAuth } = useAuthNavigation();
  const { locale } = useTranslation();
  const [context, setContext] = useState<PaymentResultContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadContext = async () => {
      const storedContext = await getPaymentResultContext();

      if (isMounted) {
        setContext(storedContext);
        setIsReady(true);
      }

      await clearPaymentResultContext();
    };

    loadContext();

    return () => {
      isMounted = false;
    };
  }, []);

  const isApproved = status === 'ok';

  const copy = useMemo(() => {
    if (isApproved) {
      return {
        icon: 'check-circle',
        iconColor: '#16a34a' as const,
        title: {
          es: 'Pago aprobado',
          en: 'Payment approved',
        },
        description: {
          es: 'El pago fue autorizado por Redsys. Puedes revisar el detalle en tu historial de pagos.',
          en: 'The payment was authorized by Redsys. You can review the details in your payment history.',
        },
        primaryLabel: {
          es: 'Ir a historial',
          en: 'Go to history',
        },
      };
    }

    return {
      icon: 'times-circle',
      iconColor: '#d75639' as const,
      title: {
        es: 'Pago rechazado',
        en: 'Payment rejected',
      },
      description: {
        es: 'Redsys devolvió un rechazo para este pago. Puedes volver e intentarlo otra vez.',
        en: 'Redsys returned a rejection for this payment. You can go back and try again.',
      },
      primaryLabel: {
        es: 'Intentar de nuevo',
        en: 'Try again',
      },
    };
  }, [isApproved]);

  const handlePrimaryAction = () => {
    if (isApproved) {
      navigateWithAuth('/(tabs)/account/payments-history', {
        buildStack: true,
      });
      return;
    }

    if (context?.retryRoute) {
      navigateWithAuth(context.retryRoute, {
        buildStack: true,
      });
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    navigateWithAuth('/(tabs)/account', {
      buildStack: true,
    });
  };

  const handleSecondaryAction = () => {
    navigateWithAuth('/(tabs)/account', {
      buildStack: true,
    });
  };

  if (!isReady) {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['top', 'bottom']}
      >
        <View className='flex-1 items-center justify-center px-6'>
          <CustomText
            type='body'
            className='text-center text-gray-600'
          >
            {locale === 'es'
              ? 'Cargando resultado del pago...'
              : 'Loading payment result...'}
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['top', 'bottom']}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className='flex-1 justify-center px-6 py-10'>
        <View className='rounded-[28px] border border-[#ece7e2] bg-[#faf7f4] px-6 py-8'>
          <View className='mb-6 items-center'>
            <View className='mb-5 h-20 w-20 items-center justify-center rounded-full bg-white'>
              <FontAwesomeIcon
                variant='bold'
                name={copy.icon}
                size={42}
                color={copy.iconColor}
              />
            </View>

            <CustomText
              type='h2'
              className='text-center text-cinnabar'
            >
              {copy.title[locale]}
            </CustomText>
          </View>

          <CustomText
            type='body'
            className='mb-4 text-center text-gray-700'
          >
            {copy.description[locale]}
          </CustomText>

          {typeof order === 'string' && order.length > 0 && (
            <View className='mb-6 rounded-2xl bg-white px-4 py-3'>
              <CustomText
                type='bodysmall'
                className='text-center text-gray-500'
              >
                {locale === 'es' ? 'Orden Redsys' : 'Redsys order'}
              </CustomText>
              <CustomText
                type='bold'
                className='mt-1 text-center text-black'
              >
                {order}
              </CustomText>
            </View>
          )}

          <Button
            mode='primary'
            onPress={handlePrimaryAction}
            className='mb-3'
          >
            {copy.primaryLabel[locale]}
          </Button>

          <Button
            mode='secondary'
            onPress={handleSecondaryAction}
          >
            {locale === 'es' ? 'Ir a cuenta' : 'Go to account'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
