import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  ArticleSecondChanceStatusConst,
  LangMap,
  OfferActorConst,
  OfferProposalStatusConst,
  OfferStatusConst,
  OfferStatusLabels,
  type Lang,
  type MyOffers,
} from '@/types/types';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import { Badge } from '@/components/ui/Badge';
import { OfferHistoryModal } from '@/components/modal/OfferHistoryModal';
import { RejectCounterOfferModal } from '@/components/modal/RejectCounterOfferModal';
import { UserCounterOfferModal } from '@/components/modal/UserCounterOfferModal';
import { AcceptCounterOfferModal } from '@/components/modal/AcceptCounterOfferModal';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { euroFormatter } from '@/utils/euroFormatter';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useToast } from '@/hooks/useToast';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

interface OfferCardProps {
  offer: MyOffers;
  lang: Lang;
  texts: {
    alreadySold: string;
    payNow: string;
    offerExpired: string;
  };
}

const OFFER_CARD_STATUS_LABELS = {
  counterReceived: {
    es: 'Contraoferta recibida',
    en: 'Counter-offer received',
  },
  pendingFinalApproval: {
    es: 'Pendiente de aprobación',
    en: 'Pending approval',
  },
  counterSent: {
    es: 'Contraoferta enviada',
    en: 'Counter-offer sent',
  },
} satisfies Record<string, Record<Lang, string>>;

const OFFER_CARD_AMOUNT_LABELS = {
  current: {
    es: 'Importe actual',
    en: 'Current amount',
  },
  counter: {
    es: 'Contraoferta actual',
    en: 'Current counter-offer',
  },
  accepted: {
    es: 'Importe aceptado',
    en: 'Accepted amount',
  },
} satisfies Record<string, Record<Lang, string>>;

const OFFER_CARD_STATE_MESSAGES = {
  initialOffer: {
    es: 'Tu oferta ha sido enviada. Esperando la respuesta de la tienda.',
    en: 'Your offer has been sent. Waiting for the store to respond.',
  },
  counterReceived: {
    es: 'La tienda ha realizado una nueva propuesta.',
    en: 'The store has made a new proposal.',
  },
  waitingForStore: {
    es: 'Has enviado una contraoferta. Esperando la respuesta de la tienda.',
    en: 'You sent a counter-offer. Waiting for the store to respond.',
  },
  pendingFinalApproval: {
    es: 'Has aceptado la contraoferta. La tienda debe confirmar que el artículo sigue disponible antes de proceder con el pago.',
    en: 'You accepted the counter-offer. The store must confirm that the article is still available before proceeding with payment.',
  },
} satisfies Record<string, Record<Lang, string>>;

const OFFER_CARD_ACTION_LABELS = {
  offerHistory: {
    es: 'Historial de ofertas',
    en: 'Offer history',
  },
  acceptCounter: {
    es: 'Aceptar contraoferta',
    en: 'Accept counter-offer',
  },
  counter: {
    es: 'Contraofertar',
    en: 'Counter',
  },
  reject: {
    es: 'Rechazar',
    en: 'Reject',
  },
} satisfies Record<string, Record<Lang, string>>;

export const OfferCard = ({ offer, lang, texts }: OfferCardProps) => {
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const { securePost } = useSecureApi();
  const { callToast } = useToast(lang);

  const formatter = euroFormatter(lang);

  const { ArticleSecondChance: articleSecondChance, status } = offer;
  const article = articleSecondChance?.Article;

  if (!article?.images?.[0]) return null;

  const currentPendingProposal = offer.ArticleOfferProposal.find(
    (proposal) => proposal.status === OfferProposalStatusConst.PENDING
  );

  const acceptedByUserProposal = offer.ArticleOfferProposal.find(
    (proposal) =>
      proposal.status === OfferProposalStatusConst.ACCEPTED_BY_USER &&
      proposal.createdBy === OfferActorConst.AUCTIONEER
  );

  const currentProposal = currentPendingProposal ?? acceptedByUserProposal;

  const displayedAmount =
    offer.acceptedAmount ?? currentProposal?.amount ?? offer.amount;

  const hasAuctioneerProposal = offer.ArticleOfferProposal.some(
    (proposal) => proposal.createdBy === OfferActorConst.AUCTIONEER
  );

  const isSold =
    articleSecondChance.status === ArticleSecondChanceStatusConst.SOLD;

  const isInitialOffer =
    status === OfferStatusConst.PENDING &&
    currentPendingProposal?.createdBy === OfferActorConst.USER &&
    !hasAuctioneerProposal;

  const isCounterReceived =
    status === OfferStatusConst.COUNTERED &&
    currentPendingProposal?.createdBy === OfferActorConst.AUCTIONEER;

  const isPendingFinalApproval =
    status === OfferStatusConst.COUNTERED &&
    acceptedByUserProposal?.createdBy === OfferActorConst.AUCTIONEER;

  const isWaitingForStore =
    !isInitialOffer &&
    status === OfferStatusConst.COUNTERED &&
    currentPendingProposal?.createdBy === OfferActorConst.USER;

  const hasExpired =
    offer.expiresAt !== null && new Date(offer.expiresAt) < new Date();

  const statusVariant =
    status === OfferStatusConst.ACCEPTED ? 'default' : 'secondary';

  let displayStatus = OfferStatusLabels[lang][status];

  if (isCounterReceived) {
    displayStatus = OFFER_CARD_STATUS_LABELS.counterReceived[lang];
  } else if (isPendingFinalApproval) {
    displayStatus = OFFER_CARD_STATUS_LABELS.pendingFinalApproval[lang];
  } else if (isWaitingForStore) {
    displayStatus = OFFER_CARD_STATUS_LABELS.counterSent[lang];
  }

  let amountLabelKey: keyof typeof OFFER_CARD_AMOUNT_LABELS = 'current';

  if (isCounterReceived) {
    amountLabelKey = 'counter';
  } else if (status === OfferStatusConst.ACCEPTED) {
    amountLabelKey = 'accepted';
  }

  let stateMessage: string | null = null;

  if (isInitialOffer) {
    stateMessage = OFFER_CARD_STATE_MESSAGES.initialOffer[lang];
  } else if (isCounterReceived) {
    stateMessage = OFFER_CARD_STATE_MESSAGES.counterReceived[lang];
  } else if (isWaitingForStore) {
    stateMessage = OFFER_CARD_STATE_MESSAGES.waitingForStore[lang];
  } else if (isPendingFinalApproval) {
    stateMessage = OFFER_CARD_STATE_MESSAGES.pendingFinalApproval[lang];
  }

  const handleAcceptCounterOffer = async (): Promise<boolean> => {
    if (!currentPendingProposal) {
      return false;
    }

    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.OFFERS.USER_ACCEPT_OFFER,
        data: {
          articleOfferId: offer.id,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: response.error,
        });

        return false;
      }

      if (response.data) {
        callToast({
          variant: 'success',
          description: response.data,
        });
      }

      return true;
    } catch (error: unknown) {
      sentryErrorReport(error, 'USER_ACCEPT_COUNTER_OFFER');
      return false;
    }
  };

  const handleCounterOffer = async (amount: number): Promise<boolean> => {
    if (!currentPendingProposal) {
      return false;
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      callToast({
        variant: 'error',
        description: {
          es: 'Ingresa un número válido',
          en: 'Enter a valid number',
        },
      });

      return false;
    }

    if (amount === currentPendingProposal.amount) {
      callToast({
        variant: 'error',
        description: {
          es: 'La contraoferta debe ser diferente al importe actual',
          en: 'The counter-offer must be different from the current amount',
        },
      });

      return false;
    }

    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.OFFERS.USER_COUNTER_OFFER,
        data: {
          articleOfferId: offer.id,
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

      if (response.data) {
        callToast({
          variant: 'success',
          description: response.data,
        });
      }

      return true;
    } catch (error: unknown) {
      sentryErrorReport(error, 'USER_COUNTER_ARTICLE_OFFER');
      return false;
    }
  };

  const handleRejectCounterOffer = async (): Promise<boolean> => {
    if (!currentPendingProposal) {
      return false;
    }

    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.OFFERS.USER_REJECT_OFFER,
        data: {
          articleOfferId: offer.id,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: response.error,
        });

        return false;
      }

      if (response.data) {
        callToast({
          variant: 'success',
          description: response.data,
        });
      }

      return true;
    } catch (error: unknown) {
      sentryErrorReport(error, 'USER_REJECT_COUNTER_OFFER');
      return false;
    }
  };

  return (
    <>
      <View className='w-full overflow-hidden rounded-xl border border-neutral-200 bg-white'>
        {/* MAIN CONTENT */}
        <View className='flex-row gap-4 p-3'>
          {/* IMAGE */}
          <CustomLink
            href={`/(tabs)/online-store/articles/${articleSecondChance.id}`}
            className='w-[42%] overflow-hidden rounded-lg'
          >
            <View className='relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-50'>
              <CustomImage
                src={article.images[0]}
                alt={article.title}
                className='h-full w-full'
                resizeMode='contain'
              />

              {!isSold && (
                <View className='absolute left-2 top-2'>
                  <Badge
                    variant={statusVariant}
                    className='self-start'
                  >
                    {displayStatus}
                  </Badge>
                </View>
              )}
            </View>
          </CustomLink>

          {/* DETAILS */}
          <View className='flex-1 gap-3 py-1'>
            <View>
              <CustomText
                type='subtitle'
                className='font-semibold'
                numberOfLines={2}
              >
                {article.title}
              </CustomText>

              <View className='mt-2'>
                <CustomText
                  type='h4'
                  className='text-cinnabar'
                >
                  {formatter.format(displayedAmount)}
                </CustomText>

                <CustomText
                  type='body'
                  className='text-sm text-neutral-500'
                >
                  {OFFER_CARD_AMOUNT_LABELS[amountLabelKey][lang]}
                </CustomText>
              </View>
            </View>

            {isSold && (
              <View className='rounded-lg bg-red-50 p-2.5'>
                <CustomText
                  type='body'
                  className='text-sm text-cinnabar'
                >
                  {texts.alreadySold}
                </CustomText>
              </View>
            )}

            {!isSold && stateMessage && (
              <View className='rounded-lg bg-neutral-50 p-2.5'>
                <CustomText
                  type='body'
                  className='text-sm text-neutral-600'
                >
                  {stateMessage}
                </CustomText>
              </View>
            )}

            <View className='flex-row items-center justify-between gap-2'>
              <CustomText
                type='body'
                className='flex-1 text-sm text-neutral-500'
              >
                {OFFER_CARD_ACTION_LABELS.offerHistory[lang]}
              </CustomText>

              <Pressable
                onPress={() => setHistoryModalVisible(true)}
                hitSlop={12}
                className='items-center justify-center rounded-lg border border-neutral-200 p-2'
              >
                <FontAwesomeIcon
                  variant='normal'
                  name='book'
                  size={16}
                  color='cinnabar'
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        {!isSold && isCounterReceived && currentPendingProposal && (
          <View className='gap-2 border-t border-neutral-100 p-3'>
            <Button
              mode='primary'
              onPress={() => setAcceptModalVisible(true)}
            >
              {OFFER_CARD_ACTION_LABELS.acceptCounter[lang]}
            </Button>

            <Button
              mode='secondary'
              onPress={() => setCounterModalVisible(true)}
            >
              {OFFER_CARD_ACTION_LABELS.counter[lang]}
            </Button>

            <Button
              mode='secondary'
              onPress={() => setRejectModalVisible(true)}
            >
              {OFFER_CARD_ACTION_LABELS.reject[lang]}
            </Button>
          </View>
        )}

        {!isSold && status === OfferStatusConst.ACCEPTED && (
          <View className='border-t border-neutral-100 p-3'>
            {hasExpired ? (
              <CustomText
                type='body'
                className='text-cinnabar'
              >
                {texts.offerExpired}
              </CustomText>
            ) : (
              <CustomLink
                href={`/(tabs)/account/single-payment?articleId=${articleSecondChance.id}`}
                mode='primary'
                size='small'
                className='w-full'
              >
                {texts.payNow}
              </CustomLink>
            )}
          </View>
        )}
      </View>

      {currentPendingProposal && (
        <>
          <AcceptCounterOfferModal
            visible={acceptModalVisible}
            onClose={() => setAcceptModalVisible(false)}
            onConfirm={handleAcceptCounterOffer}
            locale={lang}
            amount={formatter.format(currentPendingProposal.amount)}
          />

          <UserCounterOfferModal
            visible={counterModalVisible}
            onClose={() => setCounterModalVisible(false)}
            onConfirm={handleCounterOffer}
            articleOfferId={offer.id}
            currentOfferAmount={currentPendingProposal.amount}
            proposals={offer.ArticleOfferProposal}
            locale={lang}
          />

          <RejectCounterOfferModal
            visible={rejectModalVisible}
            onClose={() => setRejectModalVisible(false)}
            onConfirm={handleRejectCounterOffer}
            locale={lang}
          />
        </>
      )}

      <OfferHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        proposals={offer.ArticleOfferProposal}
        locale={lang}
      />
    </>
  );
};
