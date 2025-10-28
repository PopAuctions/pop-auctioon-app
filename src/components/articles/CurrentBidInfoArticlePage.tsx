import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Lang } from '@/types/types';
import { euroFormatter } from '@/utils/euroFormatter';
import { Divider } from '../ui/Divider';
import { CustomText } from '../ui/CustomText';
import { ArticlePriceBreakdown } from './ArticlePriceBreakdown';
// import { useHighestBidderContext } from '@/context/highest-bidder-context';

type CurrentBidInfoArticlePageProps = {
  lang: Lang;
  currentValue: number;
  estimatedValue: number | null;
  reservePrice: number | null;
  commissionValue: number;
  texts: {
    highestBid: string;
    estimatedValue: string;
    reservePrice: string;
    commission: string;
    shipping: string;
    price: string;
  };
};

export function CurrentBidInfoArticlePage({
  lang,
  currentValue,
  estimatedValue,
  reservePrice,
  commissionValue,
  texts,
}: CurrentBidInfoArticlePageProps) {
  // If you already have this context ported to RN, uncomment:
  // const { state } = useHighestBidderContext({
  //   initialValue: {
  //     currentValue,
  //   },
  // });
  // const price = state.currentValue;

  // Temporary fallback without context:
  const price = currentValue;
  const formatter = useMemo(() => euroFormatter(lang), [lang]);

  return (
    <View className='flex w-2/3 flex-col gap-1'>
      <Text className='text-lg font-bold'>{texts.highestBid}</Text>
      <ArticlePriceBreakdown
        lang={lang}
        price={price}
        commissionValue={commissionValue}
        texts={texts}
      />
      <Divider />
      <View>
        {estimatedValue && (
          <CustomText type='body'>
            {texts.estimatedValue}: {formatter.format(estimatedValue)}
          </CustomText>
        )}

        {reservePrice && (
          <CustomText
            type='bodysmall'
            className='text-cinnabar'
          >
            {texts.reservePrice}
          </CustomText>
        )}
      </View>
    </View>
  );
}
