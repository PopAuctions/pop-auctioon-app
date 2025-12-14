/**
 * Pantalla de pago con Stripe
 * Patrón similar a Next.js web:
 * 1. Recibe auctionId como query param
 * 2. Carga artículos ganados y direcciones
 * 3. Permite seleccionar dirección de envío
 * 4. Calcula breakdown de costos (subtotal, comisión, envío, descuento)
 * 5. Aplica códigos de descuento
 * 6. Pasa datos a Stripe Payment Sheet
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetWonArticles } from '@/hooks/pages/payment/useGetWonArticles';
import { useGetAddresses } from '@/hooks/pages/address/useGetAddresses';
import { useStripePayment } from '@/hooks/payment/useStripePayment';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { useGetDiscountCode } from '@/hooks/pages/payment/useGetDiscountCode';
import { useCreateArticlesPayment } from '@/hooks/pages/payment/useCreateArticlesPayment';
import { useRejectArticlesPayment } from '@/hooks/pages/payment/useRejectArticlesPayment';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { PaymentCheckoutSummary } from '@/components/payment/PaymentCheckoutSummary';
import { AddressSelector } from '@/components/payment/AddressSelector';
import { PaymentArticlesList } from '@/components/payment/PaymentArticlesList';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { REQUEST_STATUS } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { calculatePaymentDetails } from '@/utils/calculate-payment-details';
import { euroFormatter } from '@/utils/euroFormatter';
import type { CountryValue } from '@/types/types';

export default function PaymentScreen() {
  const { locale, t } = useTranslation();
  const router = useRouter();
  const { callToast } = useToast(locale);
  const { auctionId } = useLocalSearchParams<{ auctionId: string }>();

  // Cargar artículos ganados (equivalente a getUserWonAuctionArticles en web)
  const {
    data: articles,
    status: articlesStatus,
    errorMessage: articlesError,
  } = useGetWonArticles({ auctionId: auctionId || '' });

  // Cargar direcciones (equivalente a getUserAddresses en web)
  const {
    data: addresses,
    status: addressesStatus,
    errorMessage: addressesError,
    refetch: refetchAddresses,
  } = useGetAddresses();

  const {
    initializePaymentSheet,
    presentPaymentSheet,
    isLoading: paymentLoading,
    paymentIntentId,
  } = useStripePayment();

  const { createPayment } = useCreateArticlesPayment();
  const { rejectPayment } = useRejectArticlesPayment();

  // Hook para obtener porcentaje de comisión dinámico
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  // Ref para guardar el Payment Intent ID (sincronizado con el hook)
  const paymentIntentRef = useRef<string | null>(null);

  // Sincronizar el Payment Intent ID del hook con el ref local
  useEffect(() => {
    if (paymentIntentId) {
      paymentIntentRef.current = paymentIntentId;
    }
  }, [paymentIntentId]);

  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);

  // Inicializar artículos seleccionados cuando se cargan (como en web)
  useEffect(() => {
    if (articles.length > 0 && selectedArticleIds.length === 0) {
      const allIds = articles.map((a) => a.id);
      setSelectedArticleIds(allIds);
    }
  }, [articles, selectedArticleIds.length]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isInitializingPayment, setIsInitializingPayment] =
    useState<boolean>(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  const {
    validateCode,
    isValidating: isValidatingDiscount,
    discountData,
    errorMessage: discountErrorMessage,
  } = useGetDiscountCode();

  const paymentTranslations = t('screens.payment');
  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);

  // Obtener dirección seleccionada
  const selectedAddress = useMemo(() => {
    if (!selectedAddressId || !addresses) return null;
    return addresses.find((addr) => addr.id === selectedAddressId) || null;
  }, [selectedAddressId, addresses]);

  // Calcular subtotal de artículos seleccionados
  const subtotal = useMemo(() => {
    return articles
      .filter((article) => selectedArticleIds.includes(article.id))
      .reduce((sum, article) => sum + (article.soldPrice || 0), 0);
  }, [articles, selectedArticleIds]);

  // Calcular el breakdown completo de pago
  const paymentDetails = useMemo(() => {
    // Siempre mostrar el subtotal aunque no tengamos comisión
    if (!isCommissionReady) {
      return {
        subtotal,
        commission: 0,
        shipping: 0,
        discount: 0,
        total: subtotal,
      };
    }

    const details = calculatePaymentDetails({
      articlesAmount: subtotal,
      selectedCountry: selectedAddress?.country as CountryValue | null,
      commissionPercentage: commissionData || 0,
      discount: appliedDiscount?.amount || 0,
    });

    return details;
  }, [
    subtotal,
    selectedAddress,
    appliedDiscount,
    isCommissionReady,
    commissionData,
  ]);

  // Inicializar Payment Sheet una sola vez al montar (como en web antes de React 18)
  // NOTA: A diferencia de web, NO re-inicializamos en cada cambio porque crea loops
  // El monto se actualiza solo en el momento de handlePayment
  useEffect(() => {
    // Solo inicializar si hay artículos seleccionados
    if (selectedArticleIds.length === 0) {
      return;
    }

    const initPaymentSheet = async () => {
      try {
        setIsInitializingPayment(true);

        const initialized = await initializePaymentSheet(
          paymentDetails.total,
          selectedArticleIds
        );

        if (!initialized) {
          callToast({
            variant: 'error',
            description: {
              es: 'Error al preparar el pago. Inténtalo de nuevo.',
              en: 'Error preparing payment. Please try again.',
            },
          });
        }
      } catch (error) {
        callToast({
          variant: 'error',
          description: {
            es: 'Error al preparar el pago. Inténtalo de nuevo.',
            en: 'Error preparing payment. Please try again.',
          },
        });
      } finally {
        setIsInitializingPayment(false);
      }
    };

    initPaymentSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar, NO escuchar cambios

  // Toggle selección de artículo
  const toggleArticleSelection = useCallback(
    (articleId: number) => {
      setSelectedArticleIds((prev) => {
        if (prev.includes(articleId)) {
          // Prevenir deselección del último artículo (como en web)
          if (prev.length === 1) {
            callToast({
              variant: 'error',
              description: 'screens.payment.cannotDeselectLastItem',
            });
            return prev;
          }
          return prev.filter((id) => id !== articleId);
        }
        return [...prev, articleId];
      });
    },
    [callToast]
  );

  // Manejar aplicación de código de descuento
  const handleApplyDiscount = useCallback(async () => {
    if (!discountCode.trim()) {
      callToast({
        variant: 'warning',
        description: 'screens.payments.emptyDiscountCode',
      });
      return;
    }

    const isValid = await validateCode(discountCode);

    if (isValid && discountData) {
      setAppliedDiscount({
        code: discountData.code,
        amount: discountData.amount,
      });
      setDiscountCode('');
      callToast({
        variant: 'success',
        description: {
          es: `Código aplicado: ${formatter.format(discountData.amount)} de descuento`,
          en: `Code applied: ${formatter.format(discountData.amount)} discount`,
        },
      });
    } else {
      // Mostrar error específico del backend si existe
      callToast({
        variant: 'error',
        description:
          discountErrorMessage || 'screens.payments.invalidDiscountCode',
      });
    }
  }, [
    discountCode,
    validateCode,
    discountData,
    discountErrorMessage,
    callToast,
    formatter,
  ]);

  // Remover descuento aplicado
  const handleRemoveDiscount = useCallback(() => {
    setAppliedDiscount(null);
    callToast({
      variant: 'info',
      description: {
        es: 'Descuento removido',
        en: 'Discount removed',
      },
    });
  }, [callToast]);

  // Manejar el pago (flujo completo idéntico a web)
  const handlePayment = useCallback(async () => {
    if (selectedArticleIds.length === 0) {
      callToast({
        variant: 'warning',
        description: {
          es: paymentTranslations.noItemsSelected,
          en: paymentTranslations.noItemsSelected,
        },
      });
      return;
    }

    if (!selectedAddressId || !selectedAddress) {
      callToast({
        variant: 'warning',
        description: {
          es: 'Selecciona una dirección de envío',
          en: 'Select a shipping address',
        },
      });
      return;
    }

    try {
      // PASO 1: Re-inicializar Payment Sheet con monto final actualizado
      const initialized = await initializePaymentSheet(
        paymentDetails.total,
        selectedArticleIds
      );

      if (!initialized) {
        callToast({
          variant: 'error',
          description: {
            es: 'Error al preparar el pago con el monto actualizado',
            en: 'Error preparing payment with updated amount',
          },
        });
        return;
      }

      // Obtener el Payment Intent ID directamente del hook (se actualiza después de initializePaymentSheet)
      const currentPaymentIntentId = paymentIntentId;
      if (!currentPaymentIntentId) {
        callToast({
          variant: 'error',
          description: {
            es: 'Error: No se generó el ID de pago',
            en: 'Error: Payment ID not generated',
          },
        });
        return;
      }

      // PASO 2: CRÍTICO - Crear registro en BD ANTES de confirmar pago
      const { userPaymentId, error: createPaymentError } = await createPayment({
        auctionId: auctionId || '',
        articlesIds: selectedArticleIds,
        clientTotalAmount: paymentDetails.total,
        clientIntent: currentPaymentIntentId,
        country: selectedAddress.country,
        userAddressId: selectedAddressId,
        discount: appliedDiscount,
      });

      if (createPaymentError || !userPaymentId) {
        callToast({
          variant: 'error',
          description: createPaymentError || {
            es: 'Error al crear el registro de pago',
            en: 'Error creating payment record',
          },
        });
        return;
      }

      // PASO 3: Presentar Payment Sheet al usuario
      const { success, error: presentError } = await presentPaymentSheet();

      if (!success && presentError) {
        // PASO 4: CRÍTICO - Revertir registro en BD si el pago falla
        await rejectPayment({
          userPaymentId,
          errorCode: presentError.code,
          errorDescription: presentError.message,
        });

        // Mostrar error solo si NO fue cancelación del usuario
        if (presentError.code !== 'Canceled') {
          callToast({
            variant: 'error',
            description: {
              es: presentError.message || 'Error al procesar el pago',
              en: presentError.message || 'Error processing payment',
            },
          });
        }
        return;
      }

      // PASO 5: Pago exitoso
      callToast({
        variant: 'success',
        description: {
          es: paymentTranslations.paymentSuccess,
          en: paymentTranslations.paymentSuccess,
        },
      });

      router.replace('/(tabs)/account/payments-history');
    } catch (error: any) {
      console.error('❌ [PAYMENT] Unexpected error in payment flow:', error);
      callToast({
        variant: 'error',
        description: {
          es: 'Error inesperado al procesar el pago',
          en: 'Unexpected error processing payment',
        },
      });
    }
  }, [
    selectedArticleIds,
    selectedAddressId,
    selectedAddress,
    paymentDetails.total,
    auctionId,
    appliedDiscount,
    paymentIntentId,
    initializePaymentSheet,
    createPayment,
    rejectPayment,
    presentPaymentSheet,
    callToast,
    router,
    paymentTranslations,
  ]);

  // Validar que existe auctionId (después de todos los hooks)
  if (!auctionId) {
    return (
      <CustomError
        customMessage={{
          es: 'ID de subasta requerido',
          en: 'Auction ID required',
        }}
        refreshRoute='/(tabs)/account'
      />
    );
  }

  // Estados de carga y error (ambos hooks deben cargar primero)
  if (
    articlesStatus === REQUEST_STATUS.loading ||
    articlesStatus === REQUEST_STATUS.idle ||
    addressesStatus === REQUEST_STATUS.loading ||
    addressesStatus === REQUEST_STATUS.idle
  ) {
    return <Loading locale={locale} />;
  }

  if (articlesStatus === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={articlesError}
        refreshRoute='/(tabs)/account/payment'
      />
    );
  }

  if (addressesStatus === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={addressesError}
        refreshRoute='/(tabs)/account/payment'
      />
    );
  }

  // Sin artículos pendientes
  if (articles.length === 0) {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['bottom']}
      >
        <View className='flex-1 items-center justify-center px-6'>
          <CustomText
            type='h2'
            className='mb-4 text-center text-cinnabar'
          >
            {paymentTranslations.selectItems}
          </CustomText>
          <CustomText
            type='body'
            className='text-center'
          >
            {paymentTranslations.noItemsSelected}
          </CustomText>
          <Button
            mode='primary'
            onPress={() => router.back()}
            className='mt-6'
          >
            {t('commonActions.close')}
          </Button>
        </View>
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
      >
        {/* Alerta de verificación */}
        <View className='border-hairline mb-6 flex-row items-start rounded-lg border-black  p-4'>
          <View className='mr-3 mt-1'>
            <FontAwesomeIcon
              variant='bold'
              name='exclamation-triangle'
              size={20}
              color='#f59e0b'
            />
          </View>
          <CustomText
            type='bold'
            className='flex-1 text-base text-cinnabar'
          >
            {paymentTranslations.paymentAlert}
          </CustomText>
        </View>

        {/* Selector de dirección */}
        <AddressSelector
          addresses={addresses || []}
          selectedAddressId={selectedAddressId}
          selectedAddress={selectedAddress || undefined}
          onAddressChange={setSelectedAddressId}
          onAddNewAddress={() => setShowAddressModal(true)}
        />

        {/* Resumen de pago con código de descuento */}
        <PaymentCheckoutSummary
          paymentDetails={paymentDetails}
          appliedDiscount={appliedDiscount}
          discountCode={discountCode}
          onDiscountCodeChange={setDiscountCode}
          onApplyDiscount={handleApplyDiscount}
          onRemoveDiscount={handleRemoveDiscount}
          isValidatingDiscount={isValidatingDiscount}
        />

        {/* Lista de artículos */}
        <PaymentArticlesList
          articles={articles}
          selectedArticleIds={selectedArticleIds}
          onToggleArticle={toggleArticleSelection}
        />

        {/* Botón de pago */}
        <Button
          mode='primary'
          onPress={handlePayment}
          disabled={
            selectedArticleIds.length === 0 ||
            !selectedAddress ||
            paymentLoading ||
            isInitializingPayment
          }
          isLoading={paymentLoading || isInitializingPayment}
          className='mb-6'
        >
          {isInitializingPayment
            ? paymentTranslations.processing
            : paymentTranslations.payNow}
        </Button>
      </ScrollView>

      {/* Modal para agregar dirección */}
      <AddressFormModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={() => {
          setShowAddressModal(false);
          // Refetch addresses para actualizar la lista
          refetchAddresses();
        }}
      />
    </SafeAreaView>
  );
}
