import { useTranslation } from '@/hooks/i18n/useTranslation';
import { euroFormatter } from '@/utils/euroFormatter';
import { toMoney } from '@/utils/toMoney';
import { useMemo, useState } from 'react';
import { Linking, View } from 'react-native';
import { PayoutSummaryCard } from './PayoutSummaryCard';
import { CustomText } from '../ui/CustomText';
import { PayoutInfoRow } from './PayoutInfoRow';
import { CustomImage } from '../ui/CustomImage';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  SALE_TYPE_MAP,
  STORE_INVOICE_TYPES,
  STORE_INVOICE_TYPES_LABEL,
  STORE_PAYOUT_METHOD_MAP,
  STORE_PAYOUT_STATUS_MAP,
} from '@/constants/store';
import { StoreInvoiceTypes, StorePayoutWithItems } from '@/types/payouts';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useToast } from '@/hooks/useToast';
import { Button } from '../ui/Button';

export function StorePayoutDetail({
  payout,
}: {
  payout: StorePayoutWithItems;
}) {
  const { locale, t } = useTranslation();
  const [isDownloading, setDownloading] = useState<StoreInvoiceTypes | null>(
    null
  );
  const { secureGet } = useSecureApi();
  const { callToast } = useToast(locale);

  const texts = t('screens.storeSettlements');
  const formatter = useMemo(() => euroFormatter(locale, 2), [locale]);
  const dateLang = locale === 'en' ? 'en-US' : 'es-ES';
  const payoutId = payout.id;

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

  const handleDownloadInvoice = async (mode: StoreInvoiceTypes) => {
    try {
      setDownloading(mode);

      const response = await secureGet<ArrayBuffer>({
        endpoint: SECURE_ENDPOINTS.STORE.PAYOUTS[mode](payoutId.toString()),
        parseJson: false,
        includeHeaders: true,
      });

      if (response.status !== 200 || !response.data) {
        setDownloading(null);
        callToast({
          variant: 'error',
          description: {
            es: 'Error al descargar la factura. Si el problema persiste, contacta con soporte.',
            en: 'Error downloading the invoice. If the problem persists, contact support.',
          },
          durationMs: 5000,
        });
        return;
      }

      const fileName =
        response.headers?.get('x-file-name') ??
        response.headers?.get('Content-Disposition') ??
        `${STORE_INVOICE_TYPES_LABEL[mode]}.pdf`;
      console.log(response.headers);

      const arrayBuffer = response.data as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      const file = new File(Paths.document, fileName);

      file.create({ overwrite: true });
      file.write(uint8Array);

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(file.uri);
      } else {
        await Linking.openURL(file.uri);
      }
    } catch {
      callToast({
        variant: 'error',
        description: {
          es: 'Error al descargar la factura. Si el problema persiste, contacta con soporte.',
          en: 'Error downloading the invoice. If the problem persists, contact support.',
        },
        durationMs: 5000,
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <View className='gap-6'>
      <View className='gap-3'>
        <PayoutSummaryCard
          label={texts.method}
          value={STORE_PAYOUT_METHOD_MAP[locale][payout.method]}
        />
        <View className='flex flex-row gap-3'>
          <PayoutSummaryCard
            label={texts.items}
            value={String(payout.totalItems)}
          />
          <PayoutSummaryCard
            label={texts.status}
            value={STORE_PAYOUT_STATUS_MAP[locale][payout.status]}
          />
        </View>
      </View>

      <View className='gap-3'>
        <Button
          mode='primary'
          disabled={isDownloading !== null}
          isLoading={isDownloading === STORE_INVOICE_TYPES.LIQUIDATION_INVOICE}
          onPress={() =>
            handleDownloadInvoice(
              STORE_INVOICE_TYPES.LIQUIDATION_INVOICE as keyof typeof STORE_INVOICE_TYPES
            )
          }
        >
          {texts.downloadLiquidationInvoice}
        </Button>
        <Button
          mode='primary'
          disabled={isDownloading !== null}
          isLoading={isDownloading === STORE_INVOICE_TYPES.COMMISSION_INVOICE}
          onPress={() =>
            handleDownloadInvoice(
              STORE_INVOICE_TYPES.COMMISSION_INVOICE as keyof typeof STORE_INVOICE_TYPES
            )
          }
        >
          {texts.downloadCommissionInvoice}
        </Button>
      </View>
      <View>
        <CustomText
          type='h3'
          className='text-cinnabar'
        >
          {texts.payoutInformation}
        </CustomText>

        <View className='mt-3 gap-2 rounded-2xl border border-neutral-200 bg-white p-4'>
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
