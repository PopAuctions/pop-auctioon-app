import React, { useMemo, useState } from 'react';
import { Linking, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { GeneratedInvoice, Lang, UserBillingInfo } from '@/types/types';
import { SelectField } from '../fields/SelectField';
import { Translations } from '@/i18n';
import { BillingFormModal } from '../billing-info/BillingFormModal';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useCreateUserInvoice } from '@/hooks/components/useUserInvoice';
import { arrayBufferToBase64 } from '@/utils/arrayBufferToBase64';
import { useToast } from '@/hooks/useToast';
import { REQUEST_STATUS } from '@/constants';

interface BillingOption {
  value: string;
  label: string;
  data: string[];
}

type UserInvoiceProps = {
  lang: Lang;
  texts: {
    billing: string;
    generate: string;
    view: string;
  };
  billingDict: Translations['es']['screens']['billingInfo'];
  billingData: Partial<UserBillingInfo>[];
  paymentId: number;
  invoiceData: GeneratedInvoice | null;
  refetchBillingInfo: () => void;
  refetchUserInvoice: () => void;
};

export function UserInvoice({
  lang,
  texts,
  billingDict,
  billingData,
  paymentId,
  invoiceData,
  refetchBillingInfo,
  refetchUserInvoice,
}: UserInvoiceProps) {
  const [downloading, setDownloading] = useState(false);
  const [showBillinModal, setShowBillinModal] = useState(false);
  const [selectedBillingInfo, setSelectedBillingInfo] = useState<
    string[] | null
  >(null);
  const { createUserInvoice, status: createStatus } = useCreateUserInvoice({
    locale: lang,
    paymentID: paymentId.toString(),
  });
  const { secureGet } = useSecureApi();
  const { callToast } = useToast(lang);
  const creatingInvoice = createStatus === REQUEST_STATUS.loading;

  const billingDataFormatted: BillingOption[] = useMemo(
    () =>
      billingData.map((billing) => ({
        value: billing?.id ?? '',
        label: billing.label ?? '',
        data: [
          billing?.billingName ?? '',
          billing?.billingAddress ?? '',
          billing?.vatNumber ?? '',
        ],
      })),
    [billingData]
  );
  const billingDataMap = useMemo(
    () =>
      new Map(
        billingData.map((billing) => [
          billing?.id ?? '',
          {
            value: billing.id ?? '',
            label: billing.label ?? '',
            data: [
              billing.billingName,
              billing.billingAddress,
              billing.vatNumber,
            ] as string[],
          },
        ])
      ),
    [billingData]
  );

  const handleCreateInvoice = async () => {
    if (!selectedBillingInfo) {
      callToast({
        variant: 'error',
        description: {
          es: 'Selecciona una información de facturación.',
          en: 'Select a billing information.',
        },
      });
      return;
    }

    const payload = {
      billingName: selectedBillingInfo[0],
      billingAddress: selectedBillingInfo[1],
      vatNumber: selectedBillingInfo?.[2] || '',
    };

    await createUserInvoice({
      paymentId: paymentId,
      billingInfo: payload,
    });
    refetchUserInvoice();
  };

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);

      const response = await secureGet<ArrayBuffer>({
        endpoint: SECURE_ENDPOINTS.INVOICE.GET(paymentId.toString()),
        parseJson: false,
      });

      if (response.status !== 200 || !response.data) {
        setDownloading(false);
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

      const arrayBuffer = response.data as ArrayBuffer;
      const base64 = arrayBufferToBase64(arrayBuffer);
      const fileUri = `${FileSystem.documentDirectory}Factura-${paymentId}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        await Linking.openURL(fileUri);
      }
    } catch (error) {
      callToast({
        variant: 'error',
        description: {
          es: 'Error al descargar la factura. Si el problema persiste, contacta con soporte.',
          en: 'Error downloading the invoice. If the problem persists, contact support.',
        },
        durationMs: 5000,
      });
    } finally {
      setDownloading(false);
    }
  };

  if (invoiceData) {
    return (
      <View className='w-fit'>
        <Button
          mode='primary'
          size='small'
          isLoading={downloading}
          onPress={handleDownloadInvoice}
        >
          {texts.view}
        </Button>
      </View>
    );
  }

  return (
    <>
      <View className=''>
        {/* Billing selector + add button */}
        <View className='mb-3 flex w-2/3 flex-row items-end gap-2'>
          <View className='w-full grow'>
            <CustomText
              type='body'
              className='mb-1 text-sm'
            >
              {texts.billing}
            </CustomText>

            <SelectField
              value=''
              name='userBillingInfo'
              options={billingDataFormatted}
              isSearchable
              formField={true}
              onChange={(value) => {
                if (!value) {
                  setSelectedBillingInfo(null);
                  return;
                }

                const selected = billingDataMap.get(value as string);
                setSelectedBillingInfo(selected?.data ?? null);
              }}
            />
          </View>

          <View className='flex w-fit items-center'>
            <Button
              mode='secondary'
              size='small'
              disabled={downloading || creatingInvoice}
              onPress={() => {
                setShowBillinModal(true);
              }}
            >
              +
            </Button>
          </View>
        </View>

        {/* Selected billing preview */}
        {selectedBillingInfo && (
          <View className='mb-3 pl-2'>
            <CustomText
              type='body'
              className='text-sm'
            >
              <CustomText
                type='body'
                className='text-sm font-bold'
              >
                {billingDict.billingName}:
              </CustomText>{' '}
              {selectedBillingInfo[0]}
            </CustomText>

            <CustomText
              type='body'
              className='text-sm'
            >
              <CustomText
                type='body'
                className='text-sm font-bold'
              >
                {billingDict.billingAddress}:
              </CustomText>{' '}
              {selectedBillingInfo[1]}
            </CustomText>

            {selectedBillingInfo[2] && (
              <CustomText
                type='body'
                className='text-sm'
              >
                <CustomText
                  type='body'
                  className='text-sm font-bold'
                >
                  {billingDict.vatNumber}:
                </CustomText>{' '}
                {selectedBillingInfo[2]}
              </CustomText>
            )}
          </View>
        )}

        <Button
          mode='primary'
          size='small'
          onPress={handleCreateInvoice}
          isLoading={creatingInvoice}
          disabled={!selectedBillingInfo || creatingInvoice}
        >
          {texts.generate}
        </Button>
      </View>

      {/* Billing form modal */}
      {showBillinModal && (
        <BillingFormModal
          visible={showBillinModal}
          onClose={() => setShowBillinModal(false)}
          onSuccess={() => {
            refetchBillingInfo();
            setShowBillinModal(false);
          }}
        />
      )}
    </>
  );
}
