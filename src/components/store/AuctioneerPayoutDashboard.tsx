import { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { euroFormatter } from '@/utils/euroFormatter';
import { PayoutSummaryCard } from './PayoutSummaryCard';
import { PayoutSectionTitle } from './PayoutSectionTitle';
import { EmptyPayoutMessage } from './EmptyPayoutMessage';
import { PayoutInfoRow } from './PayoutInfoRow';
import { SALE_TYPE_MAP } from '@/constants/store';
import { AuctioneerPayoutDashboard as AuctioneerPayoutDashboardType } from '@/types/payouts';

export function AuctioneerPayoutDashboard({
  dashboard,
}: {
  dashboard: AuctioneerPayoutDashboardType;
}) {
  const { locale, t } = useTranslation();
  const texts = t('screens.store.payoutsDashboard');
  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);
  const dateLang = locale === 'en' ? 'en-US' : 'es-ES';

  const pendingAuctionTotal = dashboard.auctionPendingPayouts.reduce(
    (total, payout) => total + payout.totalAmount,
    0
  );

  const pendingOnlineStoreTotal = dashboard.onlineStorePendingPayouts.reduce(
    (total, payout) => total + payout.totalAmount,
    0
  );

  const paidTotal = dashboard.payoutHistory.reduce(
    (total, payout) => total + payout.totalAmount,
    0
  );

  return (
    <View className='gap-6'>
      <View className='gap-3'>
        <PayoutSummaryCard
          label={texts.auctionsPendingPayouts}
          value={formatter.format(pendingAuctionTotal)}
        />
        <PayoutSummaryCard
          label={texts.onlineStorePendingPayouts}
          value={formatter.format(pendingOnlineStoreTotal)}
        />
        <PayoutSummaryCard
          label={texts.payoutHistory}
          value={formatter.format(paidTotal)}
        />
      </View>

      <PayoutSectionTitle title={texts.auctionsPendingPayouts} />

      {dashboard.auctionPendingPayouts.length === 0 ? (
        <EmptyPayoutMessage text={texts.noPendingAuctionPayouts} />
      ) : (
        <View className='gap-3'>
          {dashboard.auctionPendingPayouts.map((payout) => (
            <View
              key={payout.auctionId}
              className='rounded-2xl border border-neutral-200 bg-white p-4'
            >
              <CustomText type='h4'>{payout.auctionTitle}</CustomText>

              <View className='mt-3 gap-2'>
                <PayoutInfoRow
                  label={texts.articles}
                  value={String(payout.articleCount)}
                />
                <PayoutInfoRow
                  label={texts.articleNetAmount}
                  value={formatter.format(payout.articleNetAmount)}
                />
                <PayoutInfoRow
                  label={texts.shipping}
                  value={formatter.format(payout.shippingAmount)}
                />
                <PayoutInfoRow
                  label={texts.payableAt}
                  value={new Date(payout.payableAt).toLocaleDateString(
                    dateLang
                  )}
                />
              </View>

              <View className='mt-4 border-t border-neutral-200 pt-3'>
                <PayoutInfoRow
                  label={texts.total}
                  value={formatter.format(payout.totalAmount)}
                  strong
                />
              </View>
            </View>
          ))}
        </View>
      )}

      <PayoutSectionTitle title={texts.onlineStorePendingPayouts} />

      {dashboard.onlineStorePendingPayouts.length === 0 ? (
        <EmptyPayoutMessage text={texts.noPendingOnlineStorePayouts} />
      ) : (
        <View className='gap-3'>
          {dashboard.onlineStorePendingPayouts.map((payout) => (
            <View
              key={payout.settlementItemId}
              className='rounded-2xl border border-neutral-200 bg-white p-4'
            >
              <CustomText type='h4'>{payout.articleTitle}</CustomText>

              <View className='mt-3 gap-2'>
                <PayoutInfoRow
                  label={texts.articleNetAmount}
                  value={formatter.format(payout.articleNetAmount)}
                />
                <PayoutInfoRow
                  label={texts.shipping}
                  value={formatter.format(payout.shippingAmount)}
                />
                <PayoutInfoRow
                  label={texts.payableAt}
                  value={new Date(payout.payableAt).toLocaleDateString(
                    dateLang
                  )}
                />
              </View>

              <View className='mt-4 border-t border-neutral-200 pt-3'>
                <PayoutInfoRow
                  label={texts.total}
                  value={formatter.format(payout.totalAmount)}
                  strong
                />
              </View>
            </View>
          ))}
        </View>
      )}

      <PayoutSectionTitle title={texts.payoutHistory} />

      {dashboard.payoutHistory.length === 0 ? (
        <EmptyPayoutMessage text={texts.noPayoutHistory} />
      ) : (
        <View className='gap-3'>
          {dashboard.payoutHistory.map((payout) => (
            <CustomLink
              key={payout.payoutId}
              mode='empty'
              href={`/(tabs)/auctioneer/payouts/${payout.payoutId}`}
              className='rounded-2xl border border-neutral-200 bg-white p-4'
            >
              <View className='flex-row items-start justify-between gap-3'>
                <View className='flex-1'>
                  <CustomText type='h4'>{payout.sourceName}</CustomText>
                  <CustomText
                    type='bodysmall'
                    className='text-gray'
                  >
                    {SALE_TYPE_MAP[locale][payout.saleType]}
                  </CustomText>
                </View>

                <CustomText
                  type='bold'
                  className='text-cinnabar'
                >
                  {formatter.format(payout.totalAmount)}
                </CustomText>
              </View>

              <View className='mt-3 gap-2'>
                <PayoutInfoRow
                  label={texts.paidAt}
                  value={new Date(payout.paidAt).toLocaleDateString(dateLang)}
                />
                <PayoutInfoRow
                  label={texts.articles}
                  value={String(payout.totalItems)}
                />
              </View>
            </CustomLink>
          ))}
        </View>
      )}
    </View>
  );
}
