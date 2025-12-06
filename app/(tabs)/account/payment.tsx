/**
 * Pantalla de pago con Stripe
 * Patrón similar a Next.js web:
 * 1. Recibe auctionId como query param
 * 2. Carga artículos ganados y direcciones
 * 3. Pasa datos a componente de pago
 */

import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetWonArticles } from '@/hooks/pages/payment/useGetWonArticles';
import { useGetAddresses } from '@/hooks/pages/address/useGetAddresses';
import { useStripePayment } from '@/hooks/payment/useStripePayment';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { CustomImage } from '@/components/ui/CustomImage';
import { REQUEST_STATUS } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Checkbox } from 'expo-checkbox';
import { cn } from '@/utils/cn';

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
  // TODO: Usar addresses para selección de dirección de envío
  const {
    data: addresses,
    status: addressesStatus,
    errorMessage: addressesError,
  } = useGetAddresses();

  const {
    initializePaymentSheet,
    presentPaymentSheet,
    isLoading: paymentLoading,
    errorMessage: paymentError,
  } = useStripePayment();

  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);

  const paymentTranslations = t('screens.payment');

  // Calcular el total de artículos seleccionados
  const totalAmount = useMemo(() => {
    return articles
      .filter((article) => selectedArticleIds.includes(article.id))
      .reduce((sum, article) => sum + (article.soldPrice || 0), 0);
  }, [articles, selectedArticleIds]);

  // Toggle selección de artículo
  const toggleArticleSelection = useCallback((articleId: number) => {
    setSelectedArticleIds((prev) => {
      if (prev.includes(articleId)) {
        return prev.filter((id) => id !== articleId);
      }
      return [...prev, articleId];
    });
  }, []);

  // Seleccionar/deseleccionar todos
  const toggleSelectAll = useCallback(() => {
    if (selectedArticleIds.length === articles.length) {
      setSelectedArticleIds([]);
    } else {
      setSelectedArticleIds(articles.map((a) => a.id));
    }
  }, [articles, selectedArticleIds.length]);

  // Manejar el pago
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

    // Inicializar Payment Sheet
    const initialized = await initializePaymentSheet(
      totalAmount,
      selectedArticleIds
    );

    if (!initialized) {
      callToast({
        variant: 'error',
        description: paymentError || {
          es: paymentTranslations.paymentInitError,
          en: paymentTranslations.paymentInitError,
        },
      });
      return;
    }

    // Presentar Payment Sheet
    const success = await presentPaymentSheet();

    if (success) {
      callToast({
        variant: 'success',
        description: {
          es: paymentTranslations.paymentSuccess,
          en: paymentTranslations.paymentSuccess,
        },
      });

      // Navegar al historial de pagos después de un pago exitoso
      router.replace('/(tabs)/account/payments-history');
    }
  }, [
    selectedArticleIds,
    totalAmount,
    initializePaymentSheet,
    presentPaymentSheet,
    paymentError,
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
        {/* Header con título y botón seleccionar todos */}
        <View className='mb-4 flex-row items-center justify-between'>
          <CustomText
            type='h3'
            className='text-cinnabar'
          >
            {paymentTranslations.selectItems}
          </CustomText>
          <Button
            mode='secondary'
            size='small'
            onPress={toggleSelectAll}
          >
            {selectedArticleIds.length === articles.length
              ? paymentTranslations.deselectAll
              : paymentTranslations.selectAll}
          </Button>
        </View>

        {/* Información de selección */}
        <View className='bg-gray-50 mb-6 rounded-lg p-4'>
          <CustomText
            type='body'
            className='text-gray-600'
          >
            {selectedArticleIds.length} {paymentTranslations.itemsSelected}
          </CustomText>
          <CustomText
            type='h4'
            className='mt-1 text-cinnabar'
          >
            {paymentTranslations.totalToPay}: ${totalAmount.toFixed(2)}
          </CustomText>
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
                    ${(article.soldPrice || 0).toFixed(2)}
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
          disabled={selectedArticleIds.length === 0 || paymentLoading}
          isLoading={paymentLoading}
          className='mb-6'
        >
          {paymentTranslations.payNow}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
