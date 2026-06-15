import { useTranslation } from '@/hooks/i18n/useTranslation';
import { StorePayoutWithItems } from '@/types/types';
import { euroFormatter } from '@/utils/euroFormatter';
import { toMoney } from '@/utils/toMoney';
import { useMemo } from 'react';
import { View } from 'react-native';
import { PayoutSummaryCard } from './PayoutSummaryCard';
import { CustomText } from '../ui/CustomText';
import { PayoutInfoRow } from './PayoutInfoRow';
import { CustomImage } from '../ui/CustomImage';
import {
  SALE_TYPE_MAP,
  STORE_PAYOUT_METHOD_MAP,
  STORE_PAYOUT_STATUS_MAP,
} from '@/constants/store';

export function StorePayoutDetail({
  payout,
}: {
  payout: StorePayoutWithItems;
}) {
  const { locale, t } = useTranslation();
  const texts = t('screens.storeSettlements');
  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);
  const dateLang = locale === 'en' ? 'en-US' : 'es-ES';

  const items = payout.StoreSettlementItem ?? [];
  const shippingRows = payout.StoreSettlementShipping ?? [];

  const shippingTotal = toMoney(
    shippingRows.reduce((total, row) => total + Number(row.shippingAmount), 0)
  );

  const grossTotal = toMoney(
    items.reduce((total, item) => total + Number(item.grossAmount), 0)
  );

  const platformTotal = toMoney(
    items.reduce(
      (total, item) => total + Number(item.platformTotalCommissionAmount),
      0
    )
  );

  const storePayoutTotal = toMoney(
    items.reduce((total, item) => total + Number(item.sellerNetAmount), 0)
  );

  const totalPaid = Number(payout.totalAmount);

  return (
    <View className='gap-6'>
      <View className='gap-3'>
        <PayoutSummaryCard
          label={texts.items}
          value={String(payout.totalItems)}
        />
        <PayoutSummaryCard
          label={texts.method}
          value={STORE_PAYOUT_METHOD_MAP[locale][payout.method]}
        />
        <PayoutSummaryCard
          label={texts.status}
          value={STORE_PAYOUT_STATUS_MAP[locale][payout.status]}
        />
      </View>

      <View className='rounded-2xl border border-neutral-200 bg-white p-4'>
        <CustomText
          type='h3'
          className='text-cinnabar'
        >
          {texts.payoutInformation}
        </CustomText>

        <View className='mt-3 gap-2'>
          <PayoutInfoRow
            label={texts.paidAt}
            value={new Date(payout.paidAt).toLocaleDateString(dateLang)}
          />

          {payout.reference && (
            <PayoutInfoRow
              label={texts.reference}
              value={payout.reference}
            />
          )}

          {payout.notes && (
            <PayoutInfoRow
              label={texts.notes}
              value={payout.notes}
            />
          )}

          {payout.receiptUrl && (
            <PayoutInfoRow
              label={texts.receipt}
              value={texts.viewReceipt}
            />
          )}
        </View>
      </View>

      <View className='gap-3'>
        <PayoutSummaryCard
          label={texts.grossAmount}
          value={formatter.format(grossTotal)}
        />
        <PayoutSummaryCard
          label={texts.platform}
          value={formatter.format(platformTotal)}
        />
        <PayoutSummaryCard
          label={texts.articlePayout}
          value={formatter.format(storePayoutTotal)}
        />
        <PayoutSummaryCard
          label={texts.shipping}
          value={formatter.format(shippingTotal)}
        />
        <PayoutSummaryCard
          label={texts.total}
          value={formatter.format(totalPaid)}
        />
      </View>

      <View className='gap-3'>
        <CustomText
          type='h3'
          className='text-cinnabar'
        >
          {texts.articles}
        </CustomText>

        {items.map((item) => (
          <View
            key={item.id}
            className='rounded-2xl border border-neutral-200 bg-white p-4'
          >
            <View className='flex-row gap-3'>
              {item.Article?.images?.[0] && (
                <CustomImage
                  alt={item.Article.title}
                  src={item.Article.images[0]}
                  className='h-16 w-16 rounded-xl'
                />
              )}

              <View className='flex-1'>
                <CustomText type='h4'>{item.Article?.title ?? '-'}</CustomText>
                <CustomText
                  type='bodysmall'
                  className='text-gray'
                >
                  {SALE_TYPE_MAP[locale][item.saleType]}
                </CustomText>
              </View>
            </View>

            <View className='mt-4 gap-2'>
              <PayoutInfoRow
                label={texts.grossAmount}
                value={formatter.format(Number(item.grossAmount))}
              />
              <PayoutInfoRow
                label={texts.platform}
                value={formatter.format(
                  Number(item.platformTotalCommissionAmount)
                )}
              />
              <PayoutInfoRow
                label={texts.articlePayout}
                value={formatter.format(Number(item.sellerNetAmount))}
                strong
              />
              <PayoutInfoRow
                label={texts.soldAt}
                value={new Date(item.soldAt).toLocaleDateString(dateLang)}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
