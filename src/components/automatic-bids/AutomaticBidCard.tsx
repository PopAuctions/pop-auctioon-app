import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import { AutomaticBidModal } from '@/components/modal/AutomaticBidModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { toTotal } from '@/utils/toTotal';
import { euroFormatter } from '@/utils/euroFormatter';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { ARTICLE_BRANDS_LABELS } from '@/constants';
import { AutoBidArticle, LangMap } from '@/types/types';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';

type AutomaticBidCardProps = {
  autoBid: AutoBidArticle;
  onRefresh: () => Promise<void>;
  commissionAmount: number;
};

export function AutomaticBidCard({
  autoBid,
  onRefresh,
  commissionAmount,
}: AutomaticBidCardProps) {
  const {
    id,
    Article: article,
    maxAmount,
    minBid,
    isActive,
    isEligible,
  } = autoBid;

  const { t, locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [automaticBidModalVisible, setAutomaticBidModalVisible] =
    useState(false);
  const { callToast } = useToast(locale);
  const { securePost, securePatch } = useSecureApi();

  const texts = t('screens.autoBids');

  const formatter = useMemo(() => euroFormatter(locale), [locale]);

  if (!article?.images?.[0] || !article.ArticleBid) return null;

  const currentValue = article.ArticleBid.currentValue;

  const computedMinBid = toTotal(minBid + currentValue, commissionAmount);

  const currentValueWithCommission = getArticleCommissionedPrice(
    currentValue,
    commissionAmount
  );

  const maxAmountWithCommission = getArticleCommissionedPrice(
    maxAmount,
    commissionAmount
  );

  const statusText = !isActive
    ? texts.unactive
    : isEligible
      ? texts.active
      : texts.ineligible;

  const statusClassName = !isActive
    ? 'text-neutral-400'
    : isEligible
      ? 'text-green-600'
      : 'text-orange-500';

  const handleUpdateAutomaticBid = async (amount: string) => {
    if (Number(amount) < computedMinBid) {
      const message = texts.minBid + ' ' + formatter.format(computedMinBid);

      callToast({
        variant: 'error',
        description: { es: message, en: message },
      });

      return false;
    }

    setIsLoading(true);

    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.AUTO_BID.CREATE,
        data: {
          articleId: article.id,
          maxAmount: Number(amount),
        },
      });

      if (response.error) return false;

      callToast({
        variant: 'success',
        description: response.data,
      });

      await onRefresh();
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutomaticBid = async () => {
    setIsLoading(true);

    console.log({ id, isActive });
    try {
      const response = await securePatch<LangMap>({
        endpoint: SECURE_ENDPOINTS.AUTO_BID.DEACTIVATE,
        data: {
          autoBidId: id,
          isActive: isActive,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: response.error,
        });

        return false;
      }

      callToast({
        variant: 'success',
        description: response.data,
      });

      await onRefresh();
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className='flex w-full flex-row gap-5 rounded-xl bg-white'>
      <CustomLink
        href={`/(tabs)/auctions/articles/${article.id}`}
        className='w-1/2 justify-center overflow-hidden rounded-lg'
      >
        <View className='w-full items-center justify-center overflow-hidden rounded-lg'>
          <CustomImage
            src={article.images[0]}
            alt={article.title}
            className='aspect-square w-full'
            resizeMode='cover'
          />
        </View>
      </CustomLink>

      <View className='flex w-1/2 flex-col justify-between gap-3'>
        <View>
          <CustomText
            type='body'
            className={`font-semibold ${statusClassName}`}
          >
            {statusText}
          </CustomText>

          <CustomText
            type='subtitle'
            className='font-semibold'
          >
            {texts.currentBid} {formatter.format(currentValueWithCommission)}
          </CustomText>

          <CustomText type='body'>{article.title}</CustomText>

          {!!article.brand && (
            <CustomText
              type='body'
              className='text-cinnabar'
            >
              {ARTICLE_BRANDS_LABELS[
                article.brand as keyof typeof ARTICLE_BRANDS_LABELS
              ] ?? article.brand}
            </CustomText>
          )}

          <CustomText
            type='body'
            className='mt-2 text-neutral-600'
          >
            {texts.configuredAmount}:{' '}
            {formatter.format(maxAmountWithCommission)}
          </CustomText>
        </View>

        <View className='gap-2'>
          <Button
            mode='primary'
            size='small'
            disabled={isLoading}
            onPress={() => {
              setAutomaticBidModalVisible(true);
            }}
          >
            {texts.edit}
          </Button>

          <ConfirmModal
            mode='secondary'
            onConfirm={handleToggleAutomaticBid}
            isDisabled={isLoading}
            title={
              isActive
                ? {
                    es: texts.deactivateTitle,
                    en: texts.deactivateTitle,
                  }
                : {
                    es: texts.activateTitle,
                    en: texts.activateTitle,
                  }
            }
            description={
              isActive
                ? {
                    es: texts.deactivateDescription,
                    en: texts.deactivateDescription,
                  }
                : {
                    es: texts.activateDescription,
                    en: texts.activateDescription,
                  }
            }
            locale={locale}
          >
            {isActive ? texts.deactivate : texts.activate}
          </ConfirmModal>

          <AutomaticBidModal
            visible={automaticBidModalVisible}
            onClose={() => setAutomaticBidModalVisible(false)}
            onConfirm={handleUpdateAutomaticBid}
            title={{
              es: 'Editar puja automática',
              en: 'Update automatic bid',
            }}
            description={{
              es: 'La puja automática te permite establecer un monto máximo para este artículo. Si otros usuarios pujan, el sistema pujará automáticamente por ti hasta alcanzar ese monto máximo.',
              en: 'Automatic bidding lets you set a maximum amount for this item. If other users place bids, the system will automatically bid on your behalf until your maximum amount is reached.',
            }}
            extraMessage={{
              es: 'Si aún no eres el mejor postor, el sistema realizará automáticamente la puja mínima necesaria por ti al configurar la puja automática.',
              en: 'If you are not currently the highest bidder, the system will automatically place the minimum required bid on your behalf when configuring the automatic bid.',
            }}
            defaultValue={String(Math.floor(maxAmountWithCommission))}
            minAmount={computedMinBid}
          />
        </View>
      </View>
    </View>
  );
}
