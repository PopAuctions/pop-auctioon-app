import { View } from 'react-native';
import { Lang } from '@/types/types';
import { Divider } from '../ui/Divider';
import { LOW_COMMISSION_AMOUNT } from '@/constants';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { CustomText } from '../ui/CustomText';
import { useMemo } from 'react';
import { euroFormatter } from '@/utils/euroFormatter';
import { Tooltip } from '../ui/Tooltip';

type OnlineStorePriceInfoProps = {
  lang: Lang;
  currentPrice: number;
  texts: {
    shipping: string;
    price: string;
  };
};

export function OnlineStorePriceInfo({
  lang,
  currentPrice,
  texts,
}: OnlineStorePriceInfoProps) {
  const formatter = useMemo(() => euroFormatter(lang), [lang]);
  const commissionedPrice = getArticleCommissionedPrice(
    currentPrice,
    LOW_COMMISSION_AMOUNT
  );

  return (
    <View className='flex w-2/3 flex-col gap-1 self-center'>
      <CustomText type='h4'>{texts.price}</CustomText>
      <View className='relative flex flex-row items-start gap-2'>
        <CustomText type='h2'>{formatter.format(commissionedPrice)}</CustomText>
        <Tooltip text={texts.shipping} />
      </View>
      <Divider />
    </View>
  );
}
