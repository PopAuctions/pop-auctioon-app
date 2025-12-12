import { View, TextInput } from 'react-native';
import type { BiddingAmounts, HighestBidderState } from '@/types/types';
import type { Translations } from '@/i18n';
import { CustomText } from '../ui/CustomText';
import { Button } from '../ui/Button';
import { toTotal } from '@/utils/toTotal';
import { useSendBid } from '@/hooks/components/useSendBid';

type DictionaryTypeBid = Translations['es']['components']['bid'];

interface SendBidProps {
  articleServerState: HighestBidderState;
  articleId: number;
  bidLang: DictionaryTypeBid;
  biddingAmounts: BiddingAmounts;
  commissionPercentage: number;
}

export function SendBid({
  articleId,
  bidLang,
  articleServerState,
  biddingAmounts = {} as BiddingAmounts,
  commissionPercentage,
}: SendBidProps) {
  const {
    currentValue,
    isPending,
    computedMaxBid,
    computedMinBid,
    bidAmount,
    tenPercent,
    twentyFivePercent,
    fiftyPercent,
    articleAvailable,
    isTooLow,
    isTooHigh,
    setAmountToBid,
    handleInputChange,
    sendBid,
    formatter,
  } = useSendBid({
    biddingAmounts,
    articleServerState,
    articleId,
    commissionPercentage,
  });

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
              {isNaN(currentValue)
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
              {isNaN(currentValue)
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
              {isNaN(currentValue)
                ? ''
                : formatter.format(
                    toTotal(fiftyPercent + currentValue, commissionPercentage)
                  )}
            </Button>
          </View>
        </View>

        <View className='w-full'>
          <CustomText
            type='bodysmall'
            className='text-[#787878]'
          >
            {bidLang.anyBidAmount}
          </CustomText>

          <TextInput
            keyboardType='number-pad'
            value={bidAmount}
            placeholder='...'
            editable={articleAvailable}
            onChangeText={handleInputChange}
            className={`mt-2 h-10 rounded-md border px-3 text-base text-black ${
              isTooLow || isTooHigh ? 'border-red-500' : 'border-neutral-300'
            }`}
          />

          {Number(bidAmount) <= computedMaxBid ? (
            <CustomText
              type='bodysmall'
              className={`${isTooLow ? 'text-red-500' : 'text-[#787878]'}`}
            >
              {isNaN(currentValue)
                ? bidLang.minBid
                : `${bidLang.minBid} ${formatter.format(computedMinBid)}`}
            </CustomText>
          ) : (
            <CustomText
              type='bodysmall'
              className={'text-red-500'}
            >
              {bidLang.maxBid} {formatter.format(computedMaxBid)}
            </CustomText>
          )}
        </View>
      </View>

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
