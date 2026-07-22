import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  ArticleSecondChanceStatusConst,
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
    if (!currentPendingProposal) return false;

    // TODO: wire app API action
    // const result = await acceptCounterOfferByUser({
    //   articleOfferId: offer.id,
    // });

    return true;
  };

  const handleCounterOffer = async (amount: number): Promise<boolean> => {
    // TODO: wire app API action
    // const result = await counterArticleOfferByUser({
    //   articleOfferId: offer.id,
    //   amount,
    // });

    return true;
  };

  const handleRejectCounterOffer = async (): Promise<boolean> => {
    // TODO: wire app API action
    // const result = await rejectArticleOfferByUser({
    //   articleOfferId: offer.id,
    // });

    return true;
  };

  return (
    <>
      <View className='w-full overflow-hidden rounded-xl border border-neutral-200 bg-white'>
        <CustomLink
          href={`/(tabs)/online-store/articles/${articleSecondChance.id}`}
          className='w-full overflow-hidden'
        >
          <View className='relative w-full overflow-hidden'>
            <CustomImage
              src={article.images[0]}
              alt={article.title}
              className='aspect-square w-full'
              resizeMode='cover'
            />

            {!isSold && (
              <View className='absolute left-3 top-3'>
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

        <View className='gap-4 p-4'>
          <View>
            <CustomText
              type='subtitle'
              className='font-semibold'
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
            <View className='rounded-xl bg-red-50 p-3'>
              <CustomText
                type='body'
                className='text-sm text-cinnabar'
              >
                {texts.alreadySold}
              </CustomText>
            </View>
          )}

          {!isSold && stateMessage && (
            <View className='rounded-xl bg-neutral-50 p-3'>
              <CustomText
                type='body'
                className='text-sm text-neutral-600'
              >
                {stateMessage}
              </CustomText>
            </View>
          )}

          <View className='flex-row items-center justify-between'>
            <CustomText
              type='body'
              className='text-sm text-neutral-500'
            >
              {OFFER_CARD_ACTION_LABELS.offerHistory[lang]}
            </CustomText>

            <Pressable
              onPress={() => setHistoryModalVisible(true)}
              hitSlop={12}
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

          {!isSold && isCounterReceived && currentPendingProposal && (
            <View className='gap-2'>
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

          {!isSold &&
            status === OfferStatusConst.ACCEPTED &&
            (hasExpired ? (
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
              >
                {texts.payNow}
              </CustomLink>
            ))}
        </View>
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
