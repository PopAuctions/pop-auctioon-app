import React, { useMemo, useState } from 'react';
import {
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { useToast } from '@/hooks/useToast';
import { euroFormatter } from '@/utils/euroFormatter';
import { CustomText } from '../ui/CustomText';
import { Button } from '../ui/Button';
import { Lang, LangMap } from '@/types/types';
import { Input } from '../ui/Input';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { parseNumber } from '@/utils/parse-number';
import { useSignInAlertModal } from '@/context/sign-in-modal-context';

type ArticleOfferFormProps = {
  texts: { minOffer: string; submit: string; penalty: string };
  lang: Lang;
  minOffer: number;
  onlineStoreArticleId: number;
};

export function ArticleOfferForm({
  texts,
  lang,
  minOffer,
  onlineStoreArticleId,
}: ArticleOfferFormProps) {
  const { openSignInAlertModal } = useSignInAlertModal();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { securePost } = useSecureApi();
  const { callToast } = useToast(lang);

  const formatter = useMemo(() => euroFormatter(lang), [lang]);

  const numericAmount = parseInt(amount, 10);
  const isDisabled =
    isLoading ||
    amount === '' ||
    Number.isNaN(numericAmount) ||
    numericAmount < minOffer;

  const validateAndSubmit = async () => {
    const parsed = parseInt(amount, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
      callToast({
        variant: 'error',
        description: {
          es: 'Ingresa un número válido',
          en: 'Enter a valid number',
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.OFFERS.CREATE,
        data: {
          onlineStoreArticleId,
          amount: parseNumber(amount),
        },
      });

      const data = response?.data;

      if (response.error) {
        if (response.status === 401) {
          openSignInAlertModal();
        }
        callToast({ variant: 'error', description: response.error });
        return;
      }

      callToast({ variant: 'success', description: data });
      setAmount('');
    } catch (e: any) {
      console.log(e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEditing = (
    _event: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    if (!isDisabled) {
      void validateAndSubmit();
    }
  };

  const handleChange = (value: string) => {
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <View className='flex flex-col space-y-2 p-6'>
      <View className='my-3'>
        <Input
          value={amount}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmitEditing}
          keyboardType='numeric'
          placeholder='....'
          className='w-full rounded px-3 py-2'
          editable={!isLoading}
        />

        <CustomText
          type='body'
          className='text-gray-500 mt-2'
        >
          {texts.minOffer} {formatter.format(minOffer)}
        </CustomText>
      </View>

      <Button
        mode='primary'
        size='small'
        disabled={isDisabled}
        isLoading={isLoading}
        className='mt-2'
        onPress={() => {
          if (!isDisabled) {
            void validateAndSubmit();
          }
        }}
      >
        {texts.submit}
      </Button>
      <CustomText
        type='body'
        className='mt-3 text-gray'
      >
        {texts.penalty}
      </CustomText>
    </View>
  );
}
