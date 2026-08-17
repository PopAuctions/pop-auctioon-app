import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Divider } from '@/components/ui/Divider';
import { Tooltip } from '@/components/ui/Tooltip';
import { OFFER_STATUS_LABELS } from '@/constants';
import { formatDate } from '@/utils/formatDate';
import { euroFormatter } from '@/utils/euroFormatter';
import {
  ArticleSecondChanceWithOffers,
  Lang,
  LangMap,
  OfferActorConst,
  OfferProposalStatusConst,
  OfferStatusConst,
} from '@/types/types';
import { ConfirmModal } from '../modal/ConfirmModal';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useToast } from '@/hooks/useToast';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';
import { Button } from '../ui/Button';
import { StoreCounterOfferModal } from '../modal/StoreCounterOfferModal';
import { OfferHistoryModal } from '../modal/OfferHistoryModal';
import { getStorePayoutFromBuyerFacingAmount } from '@/utils/getStorePayoutFromBuyerFacingAmount';
import { CustomLink } from '../ui/CustomLink';
import { CustomImage } from '../ui/CustomImage';
import { OFFER_STATUS_COLORS } from '@/constants/myOnlineStore';

interface LatestArticleOffersCardsProps {
  articles: ArticleSecondChanceWithOffers[];
  locale: Lang;
  userCommissionValue: number;
  storeCommissionValue: number;
  refetch: () => Promise<unknown>;
  texts: {
    noOffers: string;
    accept: string;
    reject: string;
    counter: string;
  };
}

const TEXTS = {
  es: {
    article: 'Artículo',
    status: 'Estado',
    offer: 'Oferta',
    noCommissionedOffer: 'Monto que recibirás',
    noCommissionedOfferTooltip:
      'Cantidad que recibirás si aceptas la oferta y el comprador completa el pago.',
    user: 'Usuario',
    date: 'Fecha',
    expiresAt: 'Caduca en',
    actions: 'Acciones',
    offerHistory: 'Historial de ofertas',
    userAcceptedCounter: 'El usuario ha aceptado tu contraoferta',
    waitingForUser: 'Esperando respuesta del usuario',
  },
  en: {
    article: 'Article',
    status: 'Status',
    offer: 'Offer',
    noCommissionedOffer: 'Amount you will receive',
    noCommissionedOfferTooltip:
      'Amount you will receive if you accept the offer and the buyer completes the payment.',
    user: 'User',
    date: 'Date',
    expiresAt: 'Expires at',
    actions: 'Actions',
    offerHistory: 'Offer history',
    userAcceptedCounter: 'The user accepted your counter-offer',
    waitingForUser: 'Waiting for user response',
  },
};

export function LatestArticleOffersCards({
  articles,
  texts,
  locale,
  userCommissionValue,
  storeCommissionValue,
  refetch,
}: LatestArticleOffersCardsProps) {
  const { securePost } = useSecureApi();
  const { callToast } = useToast(locale);

  const [isLoading, setIsLoading] = useState(false);
  const [counterOfferId, setCounterOfferId] = useState<number | null>(null);
  const [historyOfferId, setHistoryOfferId] = useState<number | null>(null);

  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);
  const t = TEXTS[locale];

  const offersWithArticle = useMemo(
    () =>
      articles.flatMap((article) =>
        article.ArticleOffer.map((offer) => ({
          article,
          offer,
        }))
      ),
    [articles]
  );

  const handleAcceptOffer = async (offerId: number): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.OFFERS.ACCEPT(offerId),
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: response.error,
        });

        return false;
      }

      await refetch();

      callToast({
        variant: 'success',
        description: response.data,
      });

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectOffer = async (offerId: number): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.OFFERS.REJECT(offerId),
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: response.error,
        });

        return false;
      }

      await refetch();

      callToast({
        variant: 'success',
        description: response.data,
      });

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCounterOffer = async (
    offerId: number,
    amount: number
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.OFFERS.COUNTER(offerId),
        data: {
          amount,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: response.error,
        });

        return false;
      }

      await refetch();

      setCounterOfferId(null);

      callToast({
        variant: 'success',
        description: response.data,
      });

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  if (offersWithArticle.length === 0) {
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
      {offersWithArticle.map(({ article, offer }) => {
        const pendingProposal = offer.ArticleOfferProposal?.find(
          (proposal) => proposal.status === OfferProposalStatusConst.PENDING
        );

        const acceptedByUserProposal = offer.ArticleOfferProposal?.find(
          (proposal) =>
            proposal.status === OfferProposalStatusConst.ACCEPTED_BY_USER &&
            proposal.createdBy === OfferActorConst.AUCTIONEER
        );

        const currentProposal = pendingProposal ?? acceptedByUserProposal;

        const displayedAmount =
          offer.acceptedAmount ?? currentProposal?.amount ?? offer.amount;

        const canNegotiate =
          pendingProposal?.createdBy === OfferActorConst.USER &&
          (offer.status === OfferStatusConst.PENDING ||
            offer.status === OfferStatusConst.COUNTERED);

        const canFinalizeUserAcceptance =
          offer.status === OfferStatusConst.COUNTERED &&
          acceptedByUserProposal !== undefined;

        const isWaitingForUser =
          offer.status === OfferStatusConst.COUNTERED &&
          pendingProposal?.createdBy === OfferActorConst.AUCTIONEER;

        const estimatedPayout = getStorePayoutFromBuyerFacingAmount({
          buyerFacingAmount: displayedAmount,
          userCommissionPercentage: userCommissionValue,
          storeCommissionPercentage: storeCommissionValue,
        });

        return (
          <View
            key={offer.id}
            className='rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm'
          >
            <CustomLink
              href={`/(tabs)/auctioneer/my-online-store/articles/${article.id}`}
              className='flex-row items-center gap-3'
            >
              <CustomImage
                src={(article.Article.images as string[])[0]}
                alt={`${article.Article.title} image`}
                accessibilityLabel={`${article.Article.title} image`}
                className='h-16 w-16 rounded-xl'
                resizeMode='cover'
              />

              <View className='flex-1'>
                <CustomText
                  type='subtitle'
                  className='text-cinnabar'
                  numberOfLines={2}
                >
                  {article.Article.title}
                </CustomText>

                {!!article.Article.codeNumber && (
                  <CustomText
                    type='body'
                    className='text-xs text-neutral-500'
                  >
                    {article.Article.codeNumber}
                  </CustomText>
                )}
              </View>
            </CustomLink>

            <Divider className='my-3' />

            <View className='flex-row items-start justify-between gap-3'>
              <View
                className={`self-start rounded-full px-2 py-1 ${
                  OFFER_STATUS_COLORS[offer.status]
                }`}
              >
                <CustomText
                  type='body'
                  className='text-xs font-semibold'
                >
                  {OFFER_STATUS_LABELS[locale][offer.status]}
                </CustomText>
              </View>

              <View className='items-end'>
                <CustomText
                  type='body'
                  className='text-lg font-bold text-cinnabar'
                >
                  {formatter.format(displayedAmount)}
                </CustomText>

                <CustomText
                  type='body'
                  className='text-xs text-neutral-500'
                >
                  {t.offer}
                </CustomText>
              </View>
            </View>

            <Divider className='my-3' />

            <View className='gap-2'>
              <View className='flex-row justify-between gap-4'>
                <View className='flex-row items-center gap-2'>
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
                  className='text-sm font-semibold'
                >
                  {formatter.format(estimatedPayout)}
                </CustomText>
              </View>

              <View className='flex-row justify-between gap-4'>
                <CustomText
                  type='body'
                  className='text-sm text-neutral-600'
                >
                  {t.date}
                </CustomText>

                <CustomText
                  type='body'
                  className='text-sm'
                >
                  {formatDate(offer.createdAt, locale)}
                </CustomText>
              </View>

              <View className='flex-row justify-between gap-4'>
                <CustomText
                  type='body'
                  className='text-sm text-neutral-600'
                >
                  {t.expiresAt}
                </CustomText>

                <CustomText
                  type='body'
                  className='text-sm'
                >
                  {offer.expiresAt ? formatDate(offer.expiresAt, locale) : '-'}
                </CustomText>
              </View>
            </View>

            <Divider className='my-3' />

            <View className='flex-row items-center justify-between'>
              <CustomText
                type='body'
                className='text-sm text-neutral-500'
              >
                {t.offerHistory}
              </CustomText>

              <Pressable
                onPress={() => setHistoryOfferId(offer.id)}
                className='rounded-lg border border-neutral-200 p-2'
              >
                <FontAwesomeIcon
                  variant='normal'
                  name='book'
                  size={16}
                  color='cinnabar'
                />
              </Pressable>
            </View>

            {canNegotiate && pendingProposal ? (
              <>
                <Divider className='my-3' />

                <View className='gap-2'>
                  <ConfirmModal
                    mode='primary'
                    onConfirm={async () => {
                      await handleAcceptOffer(offer.id);
                    }}
                    isDisabled={isLoading}
                    title={{
                      en: 'Accept offer',
                      es: 'Aceptar oferta',
                    }}
                    description={{
                      en: 'Once accepted, the buyer will have 24 hours to complete the payment.',
                      es: 'Una vez aceptada, el comprador dispondrá de 24 horas para realizar el pago.',
                    }}
                    locale={locale}
                  >
                    {texts.accept}
                  </ConfirmModal>

                  <Button
                    mode='secondary'
                    size='small'
                    onPress={() => setCounterOfferId(offer.id)}
                    disabled={isLoading}
                  >
                    {texts.counter}
                  </Button>

                  <ConfirmModal
                    mode='secondary'
                    onConfirm={async () => {
                      await handleRejectOffer(offer.id);
                    }}
                    isDisabled={isLoading}
                    title={{
                      en: 'Reject offer',
                      es: 'Rechazar oferta',
                    }}
                    description={{
                      en: 'Are you sure you want to reject this offer? This action cannot be undone.',
                      es: '¿Estás seguro de que quieres rechazar esta oferta? Esta acción no se puede deshacer.',
                    }}
                    locale={locale}
                  >
                    {texts.reject}
                  </ConfirmModal>
                </View>
              </>
            ) : canFinalizeUserAcceptance && acceptedByUserProposal ? (
              <>
                <Divider className='my-3' />

                <View className='gap-2'>
                  <CustomText
                    type='body'
                    className='text-sm text-neutral-600'
                  >
                    {t.userAcceptedCounter}
                  </CustomText>

                  <ConfirmModal
                    mode='primary'
                    onConfirm={async () => {
                      await handleAcceptOffer(offer.id);
                    }}
                    isDisabled={isLoading}
                    title={{
                      en: 'Confirm sale',
                      es: 'Confirmar venta',
                    }}
                    description={{
                      en: `The buyer accepted your counter-offer of ${formatter.format(
                        acceptedByUserProposal.amount
                      )}. Confirm that the article is still available. The buyer will then have 24 hours to pay.`,
                      es: `El comprador ha aceptado tu contraoferta de ${formatter.format(
                        acceptedByUserProposal.amount
                      )}. Confirma que el artículo sigue disponible. Después dispondrá de 24 horas para pagar.`,
                    }}
                    locale={locale}
                  >
                    {texts.accept}
                  </ConfirmModal>

                  <ConfirmModal
                    mode='secondary'
                    onConfirm={async () => {
                      await handleRejectOffer(offer.id);
                    }}
                    isDisabled={isLoading}
                    title={{
                      en: 'Reject sale',
                      es: 'Rechazar venta',
                    }}
                    description={{
                      en: 'Reject this agreement if the article is no longer available. This will close the negotiation.',
                      es: 'Rechaza este acuerdo si el artículo ya no está disponible. Esto cerrará la negociación.',
                    }}
                    locale={locale}
                  >
                    {texts.reject}
                  </ConfirmModal>
                </View>
              </>
            ) : isWaitingForUser ? (
              <>
                <Divider className='my-3' />

                <CustomText
                  type='body'
                  className='text-sm text-neutral-500'
                >
                  {t.waitingForUser}
                </CustomText>
              </>
            ) : null}

            {counterOfferId === offer.id && pendingProposal && (
              <StoreCounterOfferModal
                visible
                onClose={() => setCounterOfferId(null)}
                onConfirm={(amount) => handleCounterOffer(offer.id, amount)}
                currentOfferAmount={pendingProposal.amount}
                proposals={offer.ArticleOfferProposal ?? []}
                locale={locale}
              />
            )}

            {historyOfferId === offer.id && (
              <OfferHistoryModal
                visible
                onClose={() => setHistoryOfferId(null)}
                proposals={offer.ArticleOfferProposal ?? []}
                locale={locale}
                perspective='store'
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
