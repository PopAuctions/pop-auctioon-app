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
import { t, type MessageKey } from '@/i18n';

interface OfferCardProps {
  offer: MyOffers;
  lang: Lang;
  texts: {
    alreadySold: string;
    payNow: string;
    offerExpired: string;
  };
}

const INVALID_OFFER_AMOUNT =
  'errors.offer.invalidNumber' as const satisfies MessageKey;
const UNCHANGED_COUNTER_OFFER =
  'errors.offer.counterAmountUnchanged' as const satisfies MessageKey;

export const OfferCard = ({ offer, lang, texts }: OfferCardProps) => {
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const { securePost } = useSecureApi();
  const { callToast } = useToast(lang);
  const offerCardTexts = t('components.offerCard', { locale: lang });

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
    displayStatus = offerCardTexts.status.counterReceived;
  } else if (isPendingFinalApproval) {
    displayStatus = offerCardTexts.status.pendingFinalApproval;
  } else if (isWaitingForStore) {
    displayStatus = offerCardTexts.status.counterSent;
  }

  let amountLabelKey: keyof typeof offerCardTexts.amount = 'current';

  if (isCounterReceived) {
    amountLabelKey = 'counter';
  } else if (status === OfferStatusConst.ACCEPTED) {
    amountLabelKey = 'accepted';
  }

  let stateMessage: string | null = null;

  if (isInitialOffer) {
    stateMessage = offerCardTexts.state.initialOffer;
  } else if (isCounterReceived) {
    stateMessage = offerCardTexts.state.counterReceived;
  } else if (isWaitingForStore) {
    stateMessage = offerCardTexts.state.waitingForStore;
  } else if (isPendingFinalApproval) {
    stateMessage = offerCardTexts.state.pendingFinalApproval;
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
        description: INVALID_OFFER_AMOUNT,
      });

      return false;
    }

    if (amount === currentPendingProposal.amount) {
      callToast({
        variant: 'error',
        description: UNCHANGED_COUNTER_OFFER,
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
                  {offerCardTexts.amount[amountLabelKey]}
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
                {offerCardTexts.actions.offerHistory}
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
              {offerCardTexts.actions.acceptCounter}
            </Button>

            <Button
              mode='secondary'
              onPress={() => setCounterModalVisible(true)}
            >
              {offerCardTexts.actions.counter}
            </Button>

            <Button
              mode='secondary'
              onPress={() => setRejectModalVisible(true)}
            >
              {offerCardTexts.actions.reject}
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
