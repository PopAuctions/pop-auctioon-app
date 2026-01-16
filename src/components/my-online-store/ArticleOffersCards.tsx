import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Divider } from '@/components/ui/Divider';
import { Tooltip } from '@/components/ui/Tooltip';
import { AMOUNT_PLACEHOLDER, OFFER_STATUS_LABELS } from '@/constants';
import { formatDate } from '@/utils/formatDate';
import { euroFormatter } from '@/utils/euroFormatter';
import {
  ArticleOffer,
  Lang,
  LangMap,
  OfferStatus,
  OfferStatusConst,
  RefetchReturn,
} from '@/types/types';
import { ConfirmModal } from '../modal/ConfirmModal';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useToast } from '@/hooks/useToast';

interface ArticleOffersCardsProps {
  offers: Pick<
    ArticleOffer,
    'id' | 'amount' | 'status' | 'expiresAt' | 'createdAt'
  >[];
  locale: Lang;
  texts: {
    noOffers: string;
    accept: string;
    reject: string;
  };
  commissionValue: number | null;
  refetch: () => RefetchReturn;
}

const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const TEXTS = {
  es: {
    status: 'Estado',
    offer: 'Oferta',
    noCommissionedOffer: 'Oferta sin comisión',
    noCommissionedOfferTooltip:
      'Cantidad que recibirás (descontando la comisión de la plataforma).',
    date: 'Fecha',
    expiresAt: 'Caduca en',
    actions: 'Acciones',
    accept: 'Aceptar',
    reject: 'Rechazar',
  },
  en: {
    status: 'Status',
    offer: 'Offer',
    noCommissionedOffer: 'No commissioned offer',
    noCommissionedOfferTooltip: `Amount you will receive (deducting the platform's commission).`,
    date: 'Date',
    expiresAt: 'Expires at',
    actions: 'Actions',
    accept: 'Accept',
    reject: 'Reject',
  },
};

export function ArticleOffersCards({
  offers,
  texts,
  locale,
  commissionValue,
  refetch,
}: ArticleOffersCardsProps) {
  const { securePost } = useSecureApi();
  const [isLoading, setIsLoading] = useState(false);
  const { callToast } = useToast(locale);

  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);
  const t = TEXTS[locale];

  const handleAcceptOffer = async (offerId: number) => {
    setIsLoading(true);
    const response = await securePost<LangMap>({
      endpoint: SECURE_ENDPOINTS.OFFERS.ACCEPT(offerId),
    });

    if (response.error) {
      callToast({
        variant: 'error',
        description: response.error,
      });
      setIsLoading(false);
      return false;
    }

    callToast({
      variant: 'success',
      description: response.data,
    });
    refetch();
    setIsLoading(false);
    return true;
  };

  const handleRejectOffer = async (offerId: number) => {
    setIsLoading(true);
    const response = await securePost<LangMap>({
      endpoint: SECURE_ENDPOINTS.OFFERS.REJECT(offerId),
    });

    if (response.error) {
      callToast({
        variant: 'error',
        description: response.error,
      });
      setIsLoading(false);
      return false;
    }

    callToast({
      variant: 'success',
      description: response.data,
    });
    refetch();
    setIsLoading(false);
    return true;
  };

  if (!offers || offers.length === 0) {
    return (
      <CustomText
        type='h4'
        className='text-center'
      >
        {texts.noOffers}
      </CustomText>
    );
  }

  return (
    <View className='gap-3'>
      {offers.map((offer) => {
        const noCommissionedOffer =
          commissionValue !== null
            ? offer.amount - offer.amount * commissionValue
            : null;
        const isPending = offer.status === OfferStatusConst.PENDING;

        return (
          <View
            key={String(offer.id)}
            className='rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm'
          >
            {/* Header row: status + offer amount */}
            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center justify-center gap-2'>
                <View
                  className={`rounded-full px-2 py-1 ${OFFER_STATUS_COLORS[offer.status]}`}
                >
                  <CustomText
                    type='body'
                    className='text-xs font-semibold text-neutral-800'
                  >
                    {OFFER_STATUS_LABELS[locale][offer.status]}
                  </CustomText>
                </View>
              </View>

              <View className='flex flex-row gap-2'>
                <CustomText
                  type='body'
                  className='text-base font-bold text-neutral-900'
                >
                  {t.offer}:
                </CustomText>
                <CustomText
                  type='body'
                  className='text-base font-bold text-neutral-900'
                >
                  {formatter.format(offer.amount)}
                </CustomText>
              </View>
            </View>

            <Divider className='my-3' />

            {/* Body */}
            <View className='gap-2'>
              <View className='flex-row justify-between'>
                <View className='flex flex-row gap-2'>
                  <CustomText
                    type='body'
                    className='text-sm text-neutral-600'
                  >
                    {t.noCommissionedOffer}
                  </CustomText>
                  <Tooltip content={t.noCommissionedOfferTooltip} />
                </View>
                <CustomText
                  type='body'
                  className='text-sm font-semibold text-neutral-900'
                >
                  {noCommissionedOffer !== null
                    ? formatter.format(noCommissionedOffer)
                    : AMOUNT_PLACEHOLDER}
                </CustomText>
              </View>

              <View className='flex-row justify-between'>
                <CustomText
                  type='body'
                  className='text-sm text-neutral-600'
                >
                  {t.date}
                </CustomText>
                <CustomText
                  type='body'
                  className='text-sm text-neutral-900'
                >
                  {formatDate(offer.createdAt, locale)}
                </CustomText>
              </View>

              <View className='flex-row justify-between'>
                <CustomText
                  type='body'
                  className='text-sm text-neutral-600'
                >
                  {t.expiresAt}
                </CustomText>
                <CustomText
                  type='body'
                  className='text-sm text-neutral-900'
                >
                  {offer.expiresAt ? formatDate(offer.expiresAt, locale) : '-'}
                </CustomText>
              </View>
            </View>

            {/* Actions only when pending */}
            {isPending ? (
              <>
                <Divider className='my-3' />

                <CustomText
                  type='body'
                  className='mb-2 text-xs font-semibold uppercase text-neutral-500'
                >
                  {t.actions}
                </CustomText>

                <View className='flex-row gap-3'>
                  <View className='flex-1'>
                    <ConfirmModal
                      mode='primary'
                      onConfirm={async () => {
                        await handleAcceptOffer(offer.id);
                      }}
                      isDisabled={isLoading}
                      title={{ en: 'Accept offer', es: 'Aceptar oferta' }}
                      description={{
                        en: 'Once you accept this offer, it will be marked as accepted and buyer will be notified that he has 24 hours to make the payment.',
                        es: 'Una vez que aceptes esta oferta, se marcará como aceptada y el comprador será notificado de que tiene 24 horas para realizar el pago.',
                      }}
                      locale={locale}
                    >
                      {texts.accept}
                    </ConfirmModal>
                  </View>

                  <View className='flex-1'>
                    <ConfirmModal
                      mode='secondary'
                      onConfirm={async () => {
                        await handleRejectOffer(offer.id);
                      }}
                      isDisabled={isLoading}
                      title={{ en: 'Reject offer', es: 'Rechazar oferta' }}
                      description={{
                        en: 'Are you sure you want to reject this offer? This action cannot be undone.',
                        es: '¿Estás seguro de que quieres rechazar esta oferta? Esta acción no se puede deshacer.',
                      }}
                      locale={locale}
                    >
                      {texts.reject}
                    </ConfirmModal>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
