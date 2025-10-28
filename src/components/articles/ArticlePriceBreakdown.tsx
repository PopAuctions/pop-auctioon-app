import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { PriceBreakdownModal } from './PriceBreakdownModal';
import { euroFormatter } from '@/utils/euroFormatter';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { Lang } from '@/types/types';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';

type ArticlePriceBreakdownProps = {
  lang: Lang;
  price: number;
  commissionValue: number;
  texts: {
    commission: string;
    shipping: string;
    price: string;
  };
  className?: string;
};

export function ArticlePriceBreakdown({
  className = '',
  lang,
  price,
  commissionValue,
  texts,
}: ArticlePriceBreakdownProps) {
  const [open, setOpen] = useState(false);

  const formatter = useMemo(() => euroFormatter(lang), [lang]);

  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(price, commissionValue),
    [price, commissionValue]
  );

  const commissionFee = useMemo(
    () => commissionedPrice - price,
    [commissionedPrice, price]
  );

  const priceFormatted = formatter.format(price);
  const commissionFeeFormatted = formatter.format(commissionFee);
  const commissionedPriceFormatted = formatter.format(commissionedPrice);

  return (
    <>
      <View
        className={`w-full flex-row items-start justify-start gap-2 ${className}`}
      >
        <Text className='text-3xl font-bold'>{commissionedPriceFormatted}</Text>

        <Pressable
          onPress={() => setOpen(true)}
          hitSlop={10}
          className='mt-1 h-5 w-5 items-center justify-center rounded-full bg-black/5'
        >
          <FontAwesomeIcon
            name='info-circle'
            size={15}
            color='cinnabar'
          />
        </Pressable>
      </View>

      <PriceBreakdownModal
        visible={open}
        onClose={() => setOpen(false)}
        texts={texts}
        priceFormatted={priceFormatted}
        commissionFeeFormatted={commissionFeeFormatted}
        commissionedPriceFormatted={commissionedPriceFormatted}
      />
    </>
  );
}
