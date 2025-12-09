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

import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetWonArticles } from '@/hooks/pages/payment/useGetWonArticles';
import { useGetAddresses } from '@/hooks/pages/address/useGetAddresses';
import { useStripePayment } from '@/hooks/payment/useStripePayment';
import { useGetDiscountCode } from '@/hooks/pages/payment/useGetDiscountCode';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { CustomImage } from '@/components/ui/CustomImage';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/fields/SelectField';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { REQUEST_STATUS } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Checkbox } from 'expo-checkbox';
import { cn } from '@/utils/cn';
import { calculatePaymentDetails } from '@/utils/calculate-payment-details';
import { euroFormatter } from '@/utils/euroFormatter';
import type { CountryValue } from '@/types/types';
import { COUNTRIES_MAP_LABEL } from '@/constants/payment';

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
  } = useStripePayment();

  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);

  // Inicializar artículos seleccionados cuando se cargan (como en web)
  useEffect(() => {
    if (articles.length > 0 && selectedArticleIds.length === 0) {
      const allIds = articles.map((a) => a.id);
      setSelectedArticleIds(allIds);
      console.log('📦 [PAYMENT] Auto-selecting all articles:', allIds);
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

  // Formatter para euros (formato europeo: 10.114,00 €)
  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);

  // DEBUG: Logs para verificar el flujo
  useEffect(() => {
    console.log('\n🔍 [PAYMENT SCREEN] Component mounted');
    console.log('📦 [PAYMENT SCREEN] auctionId:', auctionId);
  }, [auctionId]);

  useEffect(() => {
    console.log('📊 [PAYMENT SCREEN] Articles status:', articlesStatus);
    console.log(
      '📦 [PAYMENT SCREEN] Articles data:',
      articles?.length || 0,
      'items'
    );
    if (articlesError) {
      console.error('❌ [PAYMENT SCREEN] Articles error:', articlesError);
    }
  }, [articlesStatus, articles, articlesError]);

  useEffect(() => {
    console.log('📍 [PAYMENT SCREEN] Addresses status:', addressesStatus);
    console.log(
      '📦 [PAYMENT SCREEN] Addresses data:',
      addresses?.length || 0,
      'items'
    );
    if (addressesError) {
      console.error('❌ [PAYMENT SCREEN] Addresses error:', addressesError);
    }
  }, [addressesStatus, addresses, addressesError]);

  // Obtener dirección seleccionada
  const selectedAddress = useMemo(() => {
    console.log('🔍 [PAYMENT] selectedAddressId:', selectedAddressId);
    console.log('🔍 [PAYMENT] addresses length:', addresses?.length);
    if (!selectedAddressId || !addresses) return null;
    const found = addresses.find((addr) => addr.id === selectedAddressId);
    console.log('🔍 [PAYMENT] selectedAddress found:', found ? 'YES' : 'NO');
    return found || null;
  }, [selectedAddressId, addresses]);

  // Calcular subtotal de artículos seleccionados
  const subtotal = useMemo(() => {
    return articles
      .filter((article) => selectedArticleIds.includes(article.id))
      .reduce((sum, article) => sum + (article.soldPrice || 0), 0);
  }, [articles, selectedArticleIds]);

  // Calcular el breakdown completo de pago
  const paymentDetails = useMemo(() => {
    return calculatePaymentDetails({
      articlesAmount: subtotal,
      selectedCountry: selectedAddress?.country as CountryValue | null,
      discount: appliedDiscount?.amount || 0,
    });
  }, [subtotal, selectedAddress, appliedDiscount]);

  // Inicializar Payment Sheet una sola vez al montar (como en web antes de React 18)
  // NOTA: A diferencia de web, NO re-inicializamos en cada cambio porque crea loops
  // El monto se actualiza solo en el momento de handlePayment
  useEffect(() => {
    // Solo inicializar si hay artículos seleccionados
    if (selectedArticleIds.length === 0) {
      console.log('⏭️ [PAYMENT] Skipping init: no articles selected');
      return;
    }

    const initPaymentSheet = async () => {
      try {
        setIsInitializingPayment(true);
        console.log('🔄 [PAYMENT] Initializing Payment Sheet on mount');
        console.log(
          '💰 [PAYMENT] Initial total (backend will convert to cents):',
          paymentDetails.total
        );

        const initialized = await initializePaymentSheet(
          paymentDetails.total, // Backend convierte a centavos
          selectedArticleIds
        );

        if (!initialized) {
          console.error('❌ [PAYMENT] Failed to initialize Payment Sheet');
          callToast({
            variant: 'error',
            description: {
              es: 'Error al preparar el pago. Inténtalo de nuevo.',
              en: 'Error preparing payment. Please try again.',
            },
          });
        } else {
          console.log('✅ [PAYMENT] Payment Sheet ready');
        }
      } catch (error) {
        console.error(
          '❌ [PAYMENT] Exception initializing Payment Sheet:',
          error
        );
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

  // Manejar el pago
  const handlePayment = useCallback(async () => {
    console.log('\n💳 [PAYMENT] Iniciando proceso de pago');
    console.log('📦 [PAYMENT] Artículos seleccionados:', selectedArticleIds);
    console.log('💰 [PAYMENT] Total a pagar:', paymentDetails.total);

    if (selectedArticleIds.length === 0) {
      console.warn('⚠️ [PAYMENT] No hay artículos seleccionados');
      callToast({
        variant: 'warning',
        description: {
          es: paymentTranslations.noItemsSelected,
          en: paymentTranslations.noItemsSelected,
        },
      });
      return;
    }

    if (!selectedAddress) {
      callToast({
        variant: 'warning',
        description: {
          es: 'Selecciona una dirección de envío',
          en: 'Select a shipping address',
        },
      });
      return;
    }

    // Re-inicializar Payment Sheet con el monto final actualizado
    // CRÍTICO: Si esto falla, NO se debe presentar el Payment Sheet con el monto viejo
    console.log('🔄 [PAYMENT] Re-initializing Payment Sheet with final amount');
    console.log(
      '💰 [PAYMENT] Final amount to charge (backend will convert to cents):',
      paymentDetails.total
    );

    const initialized = await initializePaymentSheet(
      paymentDetails.total, // Backend convierte a centavos
      selectedArticleIds
    );
    if (!initialized) {
      console.error(
        '❌ [PAYMENT] CRITICAL: Failed to initialize Payment Sheet with updated amount'
      );
      console.error(
        '❌ [PAYMENT] Payment blocked - cannot proceed with outdated amount'
      );
      callToast({
        variant: 'error',
        description: {
          es: 'Error al preparar el pago con el monto actualizado. Por favor, inténtalo de nuevo.',
          en: 'Error preparing payment with updated amount. Please try again.',
        },
      });
      return; // STOP HERE - No presentar Payment Sheet con monto viejo
    }

    console.log(
      '✅ [PAYMENT] Payment Sheet successfully initialized with correct amount'
    );

    // Presentar Payment Sheet (solo si se inicializó correctamente)
    console.log('🔄 [PAYMENT] Presentando Payment Sheet al usuario...');
    const success = await presentPaymentSheet();

    if (success) {
      console.log('✅ [PAYMENT] Pago completado exitosamente');
      callToast({
        variant: 'success',
        description: {
          es: paymentTranslations.paymentSuccess,
          en: paymentTranslations.paymentSuccess,
        },
      });

      // Navegar al historial de pagos después de un pago exitoso
      console.log('🔄 [PAYMENT] Redirigiendo a historial de pagos');
      router.replace('/(tabs)/account/payments-history');
    } else {
      console.warn('⚠️ [PAYMENT] Pago cancelado o fallido');
    }
  }, [
    selectedArticleIds,
    selectedAddress,
    paymentDetails.total,
    initializePaymentSheet,
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

        {/* Sección: Dirección de envío */}
        <View className='mb-6'>
          <CustomText
            type='h3'
            className='mb-3 text-cinnabar'
          >
            {paymentTranslations.address}
          </CustomText>

          {/* Selector de dirección + botón "+" */}
          <View className='mb-3 flex-row items-center gap-3'>
            <View className='flex-1'>
              <SelectField
                name=''
                value={selectedAddressId || ''}
                options={
                  addresses?.map((addr) => ({
                    label: addr.nameAddress || `${addr.city}, ${addr.country}`,
                    value: addr.id,
                  })) || []
                }
                placeholder={paymentTranslations.selectAddress}
                formField={true}
                onChange={(value) => {
                  console.log(
                    '📍 [PAYMENT] SelectField onChange:',
                    value,
                    typeof value
                  );
                  setSelectedAddressId(value as string);
                }}
              />
            </View>
            <Button
              mode='secondary'
              size='small'
              onPress={() => setShowAddressModal(true)}
              className='aspect-square'
            >
              <FontAwesomeIcon
                variant='bold'
                name='plus'
                size={18}
                color='#d75639'
              />
            </Button>
          </View>

          {/* Preview de dirección seleccionada */}
          {selectedAddress && (
            <View className='mt-2 w-fit space-y-1 rounded bg-neutral-100 p-3'>
              <CustomText
                type='bodysmall'
                className='text-black'
              >
                <CustomText
                  type='bodysmall'
                  className='font-bold text-black'
                >
                  {paymentTranslations.address}:
                </CustomText>{' '}
                {selectedAddress.address}
              </CustomText>
              <CustomText
                type='bodysmall'
                className='text-black'
              >
                <CustomText
                  type='bodysmall'
                  className='font-bold text-black'
                >
                  {paymentTranslations.country}:
                </CustomText>{' '}
                {
                  COUNTRIES_MAP_LABEL[locale][
                    selectedAddress.country as CountryValue
                  ]
                }
              </CustomText>
              <CustomText
                type='bodysmall'
                className='text-black'
              >
                <CustomText
                  type='bodysmall'
                  className='font-bold text-black'
                >
                  {paymentTranslations.city}:
                </CustomText>{' '}
                {selectedAddress.city}
              </CustomText>
              <CustomText
                type='bodysmall'
                className='text-black'
              >
                <CustomText
                  type='bodysmall'
                  className='font-bold text-black'
                >
                  {paymentTranslations.state}:
                </CustomText>{' '}
                {selectedAddress.state}
              </CustomText>
              <CustomText
                type='bodysmall'
                className='text-black'
              >
                <CustomText
                  type='bodysmall'
                  className='font-bold text-black'
                >
                  {paymentTranslations.postalCode}:
                </CustomText>{' '}
                {selectedAddress.postalCode}
              </CustomText>
            </View>
          )}
        </View>

        {/* Sección: Resumen de pago */}
        <View className='mb-6'>
          <CustomText
            type='h3'
            className='mb-3 text-cinnabar'
          >
            {paymentTranslations.summary}
          </CustomText>

          <View className='bg-gray-50 rounded-lg p-4'>
            {/* Código de descuento (como en web, arriba del subtotal) */}
            <View className='mb-4'>
              <CustomText
                type='body'
                className='text-gray-700 mb-2 font-medium'
              >
                {paymentTranslations.couponCode}
              </CustomText>

              {!appliedDiscount ? (
                <View className='flex-row items-center gap-2'>
                  <View className='flex-1'>
                    <Input
                      placeholder={paymentTranslations.couponCode}
                      value={discountCode}
                      onChangeText={setDiscountCode}
                      autoCapitalize='characters'
                      editable={!isValidatingDiscount}
                    />
                  </View>
                  <Button
                    mode='secondary'
                    size='small'
                    onPress={handleApplyDiscount}
                    disabled={!discountCode.trim() || isValidatingDiscount}
                    isLoading={isValidatingDiscount}
                  >
                    {paymentTranslations.applyCoupon}
                  </Button>
                </View>
              ) : (
                <View className='relative'>
                  <Input
                    value={appliedDiscount.code}
                    editable={false}
                    className='pr-10'
                  />
                  <Button
                    mode='empty'
                    size='small'
                    onPress={handleRemoveDiscount}
                    className='absolute right-2 top-1/2 -translate-y-1/2'
                  >
                    <CustomText
                      type='body'
                      className='text-gray-600'
                    >
                      x
                    </CustomText>
                  </Button>
                </View>
              )}
            </View>

            {/* Subtotal */}
            <View className='mb-2 flex-row justify-between'>
              <CustomText
                type='body'
                className='text-gray-600'
              >
                Subtotal:
              </CustomText>
              <CustomText
                type='body'
                className='font-medium'
              >
                {formatter.format(paymentDetails.subtotal)}
              </CustomText>
            </View>

            {/* Comisión */}
            <View className='mb-2 flex-row justify-between'>
              <CustomText
                type='body'
                className='text-gray-600'
              >
                Comisión (IVA inc.):
              </CustomText>
              <CustomText
                type='body'
                className='font-medium'
              >
                {formatter.format(paymentDetails.commission)}
              </CustomText>
            </View>

            {/* Envío */}
            <View className='mb-2 flex-row justify-between'>
              <CustomText
                type='body'
                className='text-gray-600'
              >
                Envío:
              </CustomText>
              <CustomText
                type='body'
                className='font-medium'
              >
                {formatter.format(paymentDetails.shipping)}
              </CustomText>
            </View>

            {/* Descuento (si aplica) */}
            {appliedDiscount && (
              <View className='mb-2 flex-row justify-between'>
                <CustomText
                  type='body'
                  className='text-green-600'
                >
                  Descuento:
                </CustomText>
                <CustomText
                  type='body'
                  className='font-medium text-green-600'
                >
                  -{formatter.format(paymentDetails.discount)}
                </CustomText>
              </View>
            )}

            {/* Línea divisoria */}
            <View className='bg-gray-300 my-3 h-px' />

            {/* Total */}
            <View className='flex-row justify-between'>
              <CustomText
                type='h4'
                className='font-bold text-cinnabar'
              >
                Total:
              </CustomText>
              <CustomText
                type='h4'
                className='font-bold text-cinnabar'
              >
                {formatter.format(paymentDetails.total)}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Lista de artículos */}
        <View className='mb-6 flex flex-col gap-4'>
          {articles.map((article) => {
            const isSelected = selectedArticleIds.includes(article.id);

            return (
              <View
                key={article.id}
                className={cn(
                  'flex-row items-center gap-4 rounded-lg border-2 p-4',
                  isSelected
                    ? 'border-cinnabar bg-orange-50'
                    : 'border-gray-200'
                )}
              >
                {/* Checkbox */}
                <Checkbox
                  value={isSelected}
                  onValueChange={() => toggleArticleSelection(article.id)}
                  color={isSelected ? '#d75639' : undefined}
                />

                {/* Imagen del artículo */}
                <View className='aspect-square w-20 overflow-hidden rounded-lg'>
                  <CustomImage
                    src={article.image}
                    alt={article.title}
                    className='h-full w-full'
                    resizeMode='cover'
                  />
                </View>

                {/* Info del artículo */}
                <View className='flex-1'>
                  <CustomText
                    type='h4'
                    className='mb-1'
                  >
                    {article.title}
                  </CustomText>
                  {article.brand && (
                    <CustomText
                      type='bodysmall'
                      className='text-gray-500 mb-2'
                    >
                      {article.brand}
                    </CustomText>
                  )}
                  <CustomText
                    type='body'
                    className='font-bold text-cinnabar'
                  >
                    {formatter.format(article.soldPrice || 0)}
                  </CustomText>
                </View>
              </View>
            );
          })}
        </View>

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
