import { View } from 'react-native';
import { Lang } from '@/types/types';
import { Divider } from '../ui/Divider';
import { AMOUNT_PLACEHOLDER, REQUEST_STATUS } from '@/constants';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { CustomText } from '../ui/CustomText';
import { useMemo } from 'react';
import { euroFormatter } from '@/utils/euroFormatter';
import { Tooltip } from '../ui/Tooltip';
import { useFetchCommission } from '@/hooks/components/useFetchCommission';

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
  const { data: commissionData, status: commissionStatus } =
    useFetchCommission();
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  const formatter = useMemo(() => euroFormatter(lang), [lang]);
  const commissionedPrice = getArticleCommissionedPrice(
    currentPrice,
    commissionData ?? 0
  );

  return (
    <View className='flex w-2/3 flex-col gap-1 self-center'>
      <CustomText type='h4'>{texts.price}</CustomText>
      <View className='relative flex flex-row items-start gap-2'>
        <CustomText type='h2'>
          {isCommissionReady
            ? formatter.format(commissionedPrice)
            : AMOUNT_PLACEHOLDER}
        </CustomText>

        <Tooltip content={texts.shipping} />
      </View>
      <Divider />
    </View>
  );
}
