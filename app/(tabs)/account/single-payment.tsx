import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetAddresses } from '@/hooks/pages/address/useGetAddresses';
import { useRedsysPayment } from '@/hooks/payment/useRedsysPayment';
import { useFetchPaymentConfig } from '@/hooks/components/useFetchPaymentConfig';
import { useGetDiscountCode } from '@/hooks/pages/payment/useGetDiscountCode';
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
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { calculatePaymentDetails } from '@/utils/calculate-payment-details';
import { euroFormatter } from '@/utils/euroFormatter';
import type { CountryValue } from '@/types/types';
import { useFetchBuyArticle } from '@/hooks/pages/article/useFetchBuyArticle';
import { useSingleArticlePayment } from '@/hooks/pages/payment/useSingleArticlePayment';
import {
  clearPaymentResultContext,
  savePaymentResultContext,
} from '@/utils/payments/payment-result-context';

export default function SinglePaymentScreen() {
  const { locale, t } = useTranslation();
  const router = useRouter();
  const { callToast } = useToast(locale);

  const { articleId } = useLocalSearchParams<{
    articleId: string;
  }>();

  const {
    data: buyData,
    status: articleStatus,
    errorMessage: articleError,
    refetch: refetchBuyArticle,
  } = useFetchBuyArticle({ articleId });

  // Addresses
  const {
    data: addresses,
    status: addressesStatus,
    errorMessage: addressesError,
    refetch: refetchAddresses,
  } = useGetAddresses();

  const {
    initializePaymentSession,
    openPaymentBrowser,
    isLoading: paymentLoading,
  } = useRedsysPayment({ type: 'online_store' });

  const { createPayment, rejectPayment } = useSingleArticlePayment();

  // Payment config
  const { data: paymentConfig, status: commissionStatus } =
    useFetchPaymentConfig();
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] =
    useState<boolean>(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  const {
    validateCode,
    isValidating: isValidatingDiscount,
    errorMessage: discountErrorMessage,
  } = useGetDiscountCode();

  const paymentTranslations = t('screens.payment');
  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);
  const userLimitTimeDate = new Date(buyData?.userLimitTime ?? '');
  const dateLang = locale === 'en' ? 'en-US' : 'es-ES';

  const article = buyData?.article ?? null;

  // Always the single article id (or empty if not loaded)
  const selectedArticleId = article?.id ?? null;

  // Selected address object
  const selectedAddress = useMemo(() => {
    if (!selectedAddressId || !addresses) return null;
    return addresses.find((addr) => addr.id === selectedAddressId) || null;
  }, [selectedAddressId, addresses]);

  // Subtotal = single article sold price
  const subtotal = useMemo(() => {
    if (!article) return 0;
    return article.soldPrice || 0;
  }, [article]);

  // Full payment breakdown
  const paymentDetails = useMemo(() => {
    if (!isCommissionReady || !paymentConfig.shippingTaxes) {
      return {
        subtotal,
        commission: 0,
        shipping: 0,
        discount: 0,
        taxes: 0,
        total: subtotal,
      };
    }

    return calculatePaymentDetails({
      articlesAmount: subtotal,
      selectedCountry: selectedAddress?.country as CountryValue | null,
      commissionPercentage: paymentConfig.commission || 0,
      shippingTaxes: paymentConfig.shippingTaxes,
      taxPercentageArticles: paymentConfig.taxPercentageArticles || 0,
      auctionCountry: 'SPAIN',
      discount: appliedDiscount?.amount || 0,
    });
  }, [
    subtotal,
    selectedAddress,
    appliedDiscount,
    isCommissionReady,
    paymentConfig,
  ]);

  const handleApplyDiscount = useCallback(async () => {
    if (!discountCode.trim()) {
      callToast({
        variant: 'warning',
        description: 'screens.payments.emptyDiscountCode',
      });
      return;
    }

    const result = await validateCode(discountCode);

    if (result.isValid && result.data) {
      setAppliedDiscount({
        code: result.data.code,
        amount: result.data.amount,
      });
      setDiscountCode('');
      callToast({
        variant: 'success',
        description: {
          es: `Código aplicado: ${formatter.format(result.data.amount)} de descuento`,
          en: `Code applied: ${formatter.format(result.data.amount)} discount`,
        },
      });
    } else {
      callToast({
        variant: 'error',
        description:
          discountErrorMessage || 'screens.payments.invalidDiscountCode',
      });
    }
  }, [discountCode, validateCode, discountErrorMessage, callToast, formatter]);

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

  // Payment flow
  const handlePayment = useCallback(async () => {
    if (!article?.id) {
      callToast({
        variant: 'warning',
        description: {
          es: paymentTranslations.noPendingItems,
          en: paymentTranslations.noPendingItems,
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
      setIsSubmittingPayment(true);

      // 1) Re-init with final amount

      const redsysOrderId = await initializePaymentSession(
        paymentDetails.total,
        [Number(articleId)]
      );

      if (!redsysOrderId) {
        callToast({
          variant: 'error',
          description: {
            es: 'Error al preparar el pago con el monto actualizado',
            en: 'Error preparing payment session',
          },
        });
        return;
      }

      // 2) Create DB record
      const { userPaymentId, error: createPaymentError } = await createPayment({
        articleId: articleId,
        clientTotalAmount: paymentDetails.total,
        clientIntent: redsysOrderId,
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

      await savePaymentResultContext({
        flow: 'single',
        retryRoute: `/(tabs)/account/single-payment?articleId=${articleId}`,
        paymentId: userPaymentId,
        paymentIntent: redsysOrderId,
      });

      const browserResult = await openPaymentBrowser();

      if (!browserResult.success) {
        await clearPaymentResultContext();
        await rejectPayment({
          userPaymentId,
          errorCode: browserResult.error?.code,
          errorDescription: browserResult.error?.message,
        });
        return;
      }

      return;
    } catch (error: any) {
      console.error('❌ [PAYMENT] Unexpected error in payment flow:', error);
      callToast({
        variant: 'error',
        description: {
          es: 'Error inesperado al procesar el pago',
          en: 'Unexpected error processing payment',
        },
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  }, [
    article?.id,
    articleId,
    selectedAddressId,
    selectedAddress,
    paymentDetails.total,
    appliedDiscount,
    initializePaymentSession,
    createPayment,
    rejectPayment,
    openPaymentBrowser,
    callToast,
    paymentTranslations,
  ]);

  useFocusEffect(
    useCallback(() => {
      refetchBuyArticle?.();
    }, [refetchBuyArticle])
  );

  if (!articleId) {
    return (
      <CustomError
        customMessage={{
          es: 'ID de artículo requerido',
          en: 'Article ID required',
        }}
        refreshRoute={`/(tabs)/account/single-payment?articleId=${articleId}`}
      />
    );
  }

  // Loading states (buy article + addresses)
  if (
    articleStatus === REQUEST_STATUS.loading ||
    articleStatus === REQUEST_STATUS.idle ||
    addressesStatus === REQUEST_STATUS.loading ||
    addressesStatus === REQUEST_STATUS.idle
  ) {
    return <Loading locale={locale} />;
  }

  if (articleStatus === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={articleError}
        refreshRoute={`/(tabs)/account/single-payment?articleId=${articleId}`}
      />
    );
  }

  if (addressesStatus === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={addressesError}
        refreshRoute={`/(tabs)/account/single-payment?articleId=${articleId}`}
      />
    );
  }

  // No article returned (or not payable)
  if (!article) {
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
            {paymentTranslations.noPendingItems}
          </CustomText>
          <CustomText
            type='body'
            className='text-center'
          >
            {paymentTranslations.noPendingItemsDescription}
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
        <View className='py-5'>
          <CustomText
            type='subtitle'
            className='text-center'
          >
            {paymentTranslations.until}{' '}
            <CustomText
              type='subtitle'
              className='text-cinnabar'
            >
              {userLimitTimeDate.toLocaleDateString(dateLang, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })}
            </CustomText>{' '}
            {paymentTranslations.toPay}
          </CustomText>
        </View>

        {/* Alert */}
        <View className='border-hairline mb-6 flex-row items-start rounded-lg border-black p-4'>
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

        {/* Address selector */}
        <AddressSelector
          addresses={addresses || []}
          selectedAddressId={selectedAddressId}
          selectedAddress={selectedAddress || undefined}
          onAddressChange={setSelectedAddressId}
          onAddNewAddress={() => setShowAddressModal(true)}
        />

        {/* Single article (reuse list component with 1 item) */}
        <PaymentArticlesList
          articles={[article]}
          selectedArticleIds={selectedArticleId ? [selectedArticleId] : []}
          onToggleArticle={() => {}}
          showCheckBoxes={false}
        />

        {/* Summary + discount */}
        <PaymentCheckoutSummary
          paymentDetails={paymentDetails}
          appliedDiscount={appliedDiscount}
          discountCode={discountCode}
          onDiscountCodeChange={setDiscountCode}
          onApplyDiscount={handleApplyDiscount}
          onRemoveDiscount={handleRemoveDiscount}
          isValidatingDiscount={isValidatingDiscount}
        />

        {/* Pay button */}
        <Button
          mode='primary'
          onPress={handlePayment}
          disabled={
            !article?.id ||
            !selectedAddress ||
            paymentLoading ||
            isSubmittingPayment
          }
          isLoading={paymentLoading || isSubmittingPayment}
          className='mb-6'
        >
          {isSubmittingPayment
            ? paymentTranslations.processing
            : `${paymentTranslations.confirmAndPay} ${formatter.format(
                paymentDetails.total
              )}`}
        </Button>
      </ScrollView>

      <AddressFormModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={() => {
          setShowAddressModal(false);
          refetchAddresses();
        }}
        countries={isCommissionReady ? paymentConfig.countries : null}
        countriesLabel={isCommissionReady ? paymentConfig.countriesLabel : null}
      />
    </SafeAreaView>
  );
}
