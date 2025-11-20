import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { GeneratedInvoice, Lang, UserBillingInfo } from '@/types/types';
import { SelectField } from '../fields/SelectField';
import { Translations } from '@/i18n';
import { BillingFormModal } from '../billing-info/BillingFormModal';

interface BillingOption {
  value: string;
  label: string;
  data: string[];
}

type Props = {
  lang: Lang;
  texts: {
    billing: string;
    generate: string;
    download: string;
  };
  billingDict: Translations['es']['screens']['billingInfo'];
  billingData: Partial<UserBillingInfo>[];
  paymentId: number;
  companyInfo: string[];
  invoiceData: GeneratedInvoice | null;
  refetchBillingInfo: () => void;
};

export function UserInvoice({
  lang,
  texts,
  billingDict,
  billingData,
  paymentId,
  companyInfo,
  invoiceData,
  refetchBillingInfo,
}: Props) {
  const [showBillinModal, setShowBillinModal] = useState(false);
  const [selectedBillingInfo, setSelectedBillingInfo] = useState<
    string[] | null
  >(null);
  console.log({ selectedBillingInfo });

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
              billing?.billingName ?? '',
              billing?.billingAddress ?? '',
              billing?.vatNumber ?? '',
            ],
          },
        ])
      ),
    [billingData]
  );

  // If invoice already exists: show a simple "Download" button for now
  if (invoiceData) {
    return (
      <View className='w-fit'>
        <Button
          mode='primary'
          size='small'
          // later we’ll replace with the special DownloadUserInvoiceButton
          onPress={() => {
            // TODO: implement download behavior for mobile
            console.log('Download existing invoice', {
              lang,
              paymentId,
              companyInfo,
              invoiceData,
            });
          }}
        >
          {texts.download}
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
                console.log({ value });
                const selected = value as string;
                setSelectedBillingInfo(
                  billingDataMap.get(selected)?.data ?? null
                );
              }}
            />
          </View>

          <View className='flex w-fit items-center'>
            <Button
              mode='secondary'
              size='small'
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

        {/* Action button */}
        {selectedBillingInfo ? (
          <View className='w-fit'>
            <Button
              mode='primary'
              size='small'
              onPress={() => {
                // TODO: replace with special invoice generation/download button
                console.log('Generate + download invoice with billing info', {
                  lang,
                  paymentId,
                  companyInfo,
                  selectedBillingInfo,
                });
              }}
            >
              {texts.generate}
            </Button>
          </View>
        ) : (
          <View className='w-fit'>
            <Button
              mode='primary'
              size='small'
              disabled
            >
              {texts.generate}
            </Button>
          </View>
        )}
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
