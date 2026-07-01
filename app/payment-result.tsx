import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import {
  clearPaymentResultContext,
  getPaymentResultContext,
  type PaymentResultContext,
} from '@/utils/payments/payment-result-context';

type ResultStatus = 'ok' | 'ko' | 'pending';

type ServerPaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface PaymentStatusLookup {
  id: number;
  paymentIntent: string | null;
  status: ServerPaymentStatus;
  createdAt: string;
  totalAmount: number;
}

const STATUS_POLL_INTERVAL_MS = 2500;
const STATUS_POLL_MAX_ATTEMPTS = 8;

const normalizeResultStatus = (status?: string): ResultStatus => {
  if (status === 'ok') return 'ok';
  if (status === 'pending') return 'pending';
  return 'ko';
};

const normalizeServerStatus = (
  status: ServerPaymentStatus | null | undefined
): ResultStatus | null => {
  if (status === 'APPROVED') return 'ok';
  if (status === 'PENDING') return 'pending';
  if (status === 'REJECTED') return 'ko';
  return null;
};

export default function PaymentResultScreen() {
  const { status } = useLocalSearchParams<{
    status?: string;
  }>();
  const router = useRouter();
  const { navigateWithAuth } = useAuthNavigation();
  const { locale } = useTranslation();
  const { secureGet } = useSecureApi();
  const [context, setContext] = useState<PaymentResultContext | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initialResultStatus = useMemo(
    () => normalizeResultStatus(status),
    [status]
  );
  const [resolvedStatus, setResolvedStatus] =
    useState<ResultStatus>(initialResultStatus);
  const [isInitialStatusCheckPending, setIsInitialStatusCheckPending] =
    useState(true);

  useEffect(() => {
    setResolvedStatus(initialResultStatus);
    setIsInitialStatusCheckPending(true);
  }, [initialResultStatus]);

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

  const paymentStatusEndpoint = useMemo(() => {
    if (!context?.paymentId && !context?.paymentIntent) {
      return null;
    }

    return SECURE_ENDPOINTS.USER.PAYMENT_STATUS({
      paymentId: context?.paymentId,
      paymentIntent: context?.paymentIntent,
    });
  }, [context?.paymentId, context?.paymentIntent]);

  const fetchPaymentStatus = useCallback(async () => {
    if (!paymentStatusEndpoint) {
      return null;
    }

    const response = await secureGet<PaymentStatusLookup | null>({
      endpoint: paymentStatusEndpoint,
      options: {
        retries: 0,
        timeout: 6000,
      },
    });

    if (response.error) {
      return null;
    }

    return response.data ?? null;
  }, [paymentStatusEndpoint, secureGet]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!paymentStatusEndpoint) {
      setIsInitialStatusCheckPending(false);
      return;
    }

    let isActive = true;

    const reconcileStatus = async () => {
      setIsInitialStatusCheckPending(true);
      const payment = await fetchPaymentStatus();

      if (!isActive) {
        return;
      }

      const nextStatus = normalizeServerStatus(payment?.status);
      setResolvedStatus(
        nextStatus ?? (initialResultStatus === 'ok' ? 'pending' : initialResultStatus)
      );
      setIsInitialStatusCheckPending(false);
    };

    void reconcileStatus();

    return () => {
      isActive = false;
    };
  }, [fetchPaymentStatus, initialResultStatus, isReady, paymentStatusEndpoint]);

  useEffect(() => {
    if (!isReady || resolvedStatus !== 'pending' || !paymentStatusEndpoint) {
      return;
    }

    let isActive = true;

    const pollStatus = async () => {
      for (let attempt = 0; attempt < STATUS_POLL_MAX_ATTEMPTS; attempt += 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, STATUS_POLL_INTERVAL_MS)
        );

        if (!isActive) {
          return;
        }

        const payment = await fetchPaymentStatus();

        if (!isActive) {
          return;
        }

        const nextStatus = normalizeServerStatus(payment?.status);

        if (nextStatus && nextStatus !== 'pending') {
          setResolvedStatus(nextStatus);
          return;
        }
      }
    };

    void pollStatus();

    return () => {
      isActive = false;
    };
  }, [fetchPaymentStatus, isReady, paymentStatusEndpoint, resolvedStatus]);

  const resultStatus = isInitialStatusCheckPending ? 'pending' : resolvedStatus;
  const isApproved = resultStatus === 'ok';
  const isPending = resultStatus === 'pending';

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

    if (isPending) {
      return {
        icon: 'clock',
        iconColor: '#d97706' as const,
        title: {
          es: 'Confirmando pago',
          en: 'Confirming payment',
        },
        description: {
          es: 'Estamos confirmando el resultado final del pago. Si Redsys ya lo autorizó, lo verás reflejado en tu historial en breve.',
          en: 'We are confirming the final payment result. If Redsys already authorized it, it will appear in your payment history shortly.',
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
  }, [isApproved, isPending]);

  const handlePrimaryAction = () => {
    if (isApproved || isPending) {
      navigateWithAuth('/(tabs)/account/payments-history?refresh=1', {
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
            className='text-gray-600 text-center'
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
            className='text-gray-700 mb-4 text-center'
          >
            {copy.description[locale]}
          </CustomText>

          {typeof context?.paymentIntent === 'string' &&
            context.paymentIntent.length > 0 && (
              <View className='mb-6 rounded-2xl bg-white px-4 py-3'>
                <CustomText
                  type='bodysmall'
                  className='text-gray-500 text-center'
                >
                  {locale === 'es' ? 'Orden de pago' : 'Payment order'}
                </CustomText>
                <CustomText
                  type='bold'
                  className='mt-1 text-center text-black'
                >
                  {context.paymentIntent}
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
