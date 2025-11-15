import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { useToast } from '@/hooks/useToast';
import { euroFormatter } from '@/utils/euroFormatter';
import { CustomText } from '../ui/CustomText';
import { Button } from '../ui/Button';
import { Lang } from '@/types/types';

type ArticleOfferFormProps = {
  texts: { minOffer: string; submit: string; penalty: string };
  lang: Lang;
  minOffer: number;
  articleSecondChanceId: number;
};

export function ArticleOfferForm({
  texts,
  lang,
  minOffer,
  articleSecondChanceId,
}: ArticleOfferFormProps) {
  const [amount, setAmount] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
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
          es: 'Ingresa un número valido',
          en: 'Enter a valid number',
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      // const { error, success } = await makeOffer({
      //   articleSecondChanceId,
      //   offerAmount: parsed,
      // });

      // if (error) {
      //   callToast({ variant: 'error', description: error });
      //   return;
      // }

      // callToast({ variant: 'success', description: success });
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
    <View className='flex flex-col space-y-2'>
      <View className='my-3'>
        <TextInput
          value={amount}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmitEditing}
          keyboardType='numeric'
          placeholder='....'
          className='mr-2 w-1/2 rounded border border-neutral-300 px-3 py-2'
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
        className='relative mt-2'
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
