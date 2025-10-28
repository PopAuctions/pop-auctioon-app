import { useMemo, useState } from 'react';
import { View, TextInput, Text } from 'react-native';

import { ONLY_INTEGERS_REGEX } from '@/constants'; // note: check your RN path, you renamed some consts already
import { euroFormatter } from '@/utils/euroFormatter';
import type { BiddingAmounts, HighestBidderState, Lang } from '@/types/types';
import type { Translations } from '@/i18n';
import { CustomText } from '../ui/CustomText';
import { Button } from '../ui/Button';
import { toTotal } from '@/utils/toTotal';
// import * as Sentry from '@sentry/react-native'; // RN version
// import { useToast } from '@/hooks/useToast';
// import { createBid } from '@/lib/bid/create-bid'; // you'll need a mobile-safe version (API call)
// import { useHighestBidderContext } from '@/context/highest-bidder-context';

type DictionaryTypeBid = Translations['es']['components']['bid'];

type SendBidProps = {
  articleServerState?: HighestBidderState;
  articleId?: string;
  bidLang: DictionaryTypeBid;
  lang: Lang;
  biddingAmounts: BiddingAmounts;
  maxBidOffset: number;
  commissionPercentage: number;
};

export function SendBid({
  articleId,
  bidLang,
  articleServerState,
  lang,
  biddingAmounts,
  maxBidOffset,
  commissionPercentage,
}: SendBidProps) {
  const [isPending, setIsPending] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>('');

  const formatter = euroFormatter(lang);
  // const { callToast } = useToast(lang);

  const { minBid, tenPercent, twentyFivePercent, fiftyPercent } =
    biddingAmounts;

  // pull live auction state (currentValue, available) from context
  // const { state } = useHighestBidderContext({
  //   initialValue: articleServerState,
  // });
  const state = { currentValue: 2160, available: true }; // IGNORE
  const { currentValue, available: articleAvailable } = state;

  // computedMinBid = (currentValue + minBid) including commission
  const computedMinBid = useMemo(
    () => toTotal(minBid + currentValue, commissionPercentage),
    [minBid, currentValue, commissionPercentage]
  );

  // computedMaxBid = (currentValue + fiftyPercent + maxBidOffset) including commission
  const computedMaxBid = useMemo(
    () =>
      toTotal(fiftyPercent + currentValue + maxBidOffset, commissionPercentage),
    [fiftyPercent, currentValue, maxBidOffset, commissionPercentage]
  );

  // tap the preset buttons like "10%", "25%", "50%"
  const setAmountToBid = (amountBase: number) => {
    const finalBase = amountBase + currentValue;
    const total = toTotal(finalBase, commissionPercentage);
    setBidAmount(String(total));
  };

  // manual input handler
  const handleInputChange = (value: string) => {
    const numericValue = Number(value);

    // reject negatives / non-integers
    if (
      value !== '' &&
      (numericValue <= 0 ||
        !Number.isInteger(numericValue) ||
        value.includes('-'))
    ) {
      return;
    }

    // allow "" or positive integers
    if (value === '' || ONLY_INTEGERS_REGEX.test(value)) {
      setBidAmount(value);
    }
  };

  // main submit
  const sendBid = async () => {
    // enforce min
    if (parseInt(bidAmount) < computedMinBid) {
      const message = bidLang.minBid + ' ' + formatter.format(computedMinBid);
      console.log(message);

      // callToast({
      //   variant: 'error',
      //   description: { es: message, en: message },
      // });

      return;
    }

    // enforce max
    if (parseInt(bidAmount) > computedMaxBid) {
      const message = bidLang.maxBid + ' ' + formatter.format(computedMaxBid);
      console.log(message);

      // callToast({
      //   variant: 'error',
      //   description: { es: message, en: message },
      // });

      return;
    }

    // actual request
    try {
      setIsPending(true);

      // const data = await createBid(articleId, Number(bidAmount), currentValue);

      // if (data.error !== null) {
      //   console.log('ERROR_CREATE_BID', data.error);
      //   // callToast({ variant: 'error', description: data.error });
      //   return;
      // }

      // callToast({ variant: 'success', description: data.success });
      // console.log('SUCCESS_CREATE_BID', data.success);
      setBidAmount('');
    } catch (e: any) {
      console.log('CATCH_CREATE_BID', e?.message);
      // callToast({
      //   variant: 'error',
      //   description: {
      //     en: 'The bid could not be processed',
      //     es: 'La puja no pudo ser procesada',
      //   },
      // });

      // Sentry.captureException('CATCH_CREATE_BID' + e?.message);
    } finally {
      setIsPending(false);
    }
  };

  const isTooLow = parseInt(bidAmount) < computedMinBid;
  const isTooHigh = parseInt(bidAmount) > computedMaxBid;
  const isWithinRange = !isTooLow && !isTooHigh;

  return (
    <View className='w-full rounded-xl border border-neutral-200 bg-white p-4'>
      <View className='flex w-full flex-col gap-3'>
        <View className='flex flex-col gap-2'>
          <CustomText type='h4'>{bidLang.bid}</CustomText>

          <View className='flex w-full flex-row gap-2'>
            <Button
              mode='secondary'
              size='small'
              className='w-1/3'
              disabled={!articleAvailable}
              onPress={() => {
                setAmountToBid(tenPercent);
              }}
            >
              {currentValue === 0
                ? ''
                : formatter.format(
                    toTotal(tenPercent + currentValue, commissionPercentage)
                  )}
            </Button>

            <Button
              mode='secondary'
              size='small'
              className='w-1/3'
              disabled={!articleAvailable}
              onPress={() => {
                setAmountToBid(twentyFivePercent);
              }}
            >
              {currentValue === 0
                ? ''
                : formatter.format(
                    toTotal(
                      twentyFivePercent + currentValue,
                      commissionPercentage
                    )
                  )}
            </Button>

            <Button
              mode='secondary'
              size='small'
              className='w-1/3'
              disabled={!articleAvailable}
              onPress={() => {
                setAmountToBid(fiftyPercent);
              }}
            >
              {currentValue === 0
                ? ''
                : formatter.format(
                    toTotal(fiftyPercent + currentValue, commissionPercentage)
                  )}
            </Button>
          </View>
        </View>

        {/* manual bid input */}
        <View className='w-full'>
          <CustomText
            type='bodysmall'
            className='text-[#787878]'
          >
            {bidLang.anyBidAmount}
          </CustomText>

          {/* TextInput instead of <Input /> */}
          <TextInput
            keyboardType='number-pad'
            value={bidAmount}
            placeholder='...'
            editable={articleAvailable}
            onChangeText={handleInputChange}
            className={`mt-2 h-10 rounded-md border px-3 text-base text-black ${
              isTooLow ? 'border-red-500' : 'border-neutral-300'
            }`}
          />

          {/* helper / error text under input */}
          {isWithinRange ? (
            <CustomText
              type='bodysmall'
              className={isTooLow ? 'text-red-500' : 'text-[#787878]'}
            >
              {currentValue === 0
                ? bidLang.minBid
                : `${bidLang.minBid} ${formatter.format(computedMinBid)}`}
            </CustomText>
          ) : (
            <CustomText
              type='bodysmall'
              className='text-red-500'
            >
              {bidLang.maxBid} {formatter.format(computedMaxBid)}
            </CustomText>
          )}
        </View>
      </View>

      {/* submit button */}
      <SubmitBidButton
        isPending={isPending}
        bidAmount={bidAmount}
        minBid={computedMinBid}
        maxBid={computedMaxBid}
        bidLang={bidLang}
        onPress={sendBid}
        articleAvailable={articleAvailable}
      />
    </View>
  );
}

function SubmitBidButton({
  isPending,
  bidAmount,
  minBid,
  maxBid,
  bidLang,
  onPress,
  articleAvailable,
}: {
  isPending: boolean;
  bidAmount: string;
  minBid: number;
  maxBid: number;
  bidLang: DictionaryTypeBid;
  onPress: () => void;
  articleAvailable: boolean;
}) {
  const disabled =
    isPending ||
    bidAmount === '' ||
    parseInt(bidAmount) < minBid ||
    parseInt(bidAmount) > maxBid ||
    !articleAvailable;

  return (
    <Button
      mode='primary'
      size='small'
      className='w-full rounded-md py-3'
      disabled={disabled}
      onPress={onPress}
    >
      {bidLang.sendBid}
    </Button>
  );
}
