import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { euroFormatter } from '@/utils/euroFormatter';
import {
  OfferActorConst,
  type Lang,
  type MyOfferProposal,
} from '@/types/types';

interface UserCounterOfferModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<boolean>;
  articleOfferId: number;
  currentOfferAmount: number;
  proposals: MyOfferProposal[];
  locale: Lang;
}

const TEXTS = {
  es: {
    title: 'Realizar contraoferta',
    description: 'Introduce el importe que deseas proponer a la tienda.',
    currentOffer: 'Oferta actual',
    negotiationHistory: 'Historial de negociación',
    you: 'Tú',
    store: 'Tienda',
    label: 'Importe de la contraoferta (€)',
    invalidAmount: 'Introduce un importe válido',
    sameAmount: 'La contraoferta debe ser diferente al importe actual',
    confirm: 'Enviar contraoferta',
    cancel: 'Cancelar',
  },
  en: {
    title: 'Make counter-offer',
    description: 'Enter the amount you want to propose to the store.',
    currentOffer: 'Current offer',
    negotiationHistory: 'Negotiation history',
    you: 'You',
    store: 'Store',
    label: 'Counter-offer amount (€)',
    invalidAmount: 'Enter a valid amount',
    sameAmount: 'The counter-offer must be different from the current amount',
    confirm: 'Send counter-offer',
    cancel: 'Cancel',
  },
} satisfies Record<Lang, Record<string, string>>;

export function UserCounterOfferModal({
  visible,
  onClose,
  onConfirm,
  currentOfferAmount,
  proposals,
  locale,
}: UserCounterOfferModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const texts = TEXTS[locale];
  const formatter = useMemo(() => euroFormatter(locale), [locale]);

  const numericAmount = Number(inputValue);

  const isValidAmount =
    Number.isSafeInteger(numericAmount) &&
    numericAmount > 0 &&
    numericAmount !== currentOfferAmount;

  const sortedProposals = useMemo(
    () =>
      [...proposals].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [proposals]
  );

  useEffect(() => {
    if (!visible) {
      setInputValue('');
    }
  }, [visible]);

  const handleChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleConfirm = async () => {
    if (!isValidAmount) return;

    setIsLoading(true);

    try {
      const success = await onConfirm(numericAmount);

      if (success) {
        setInputValue('');
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType='fade'
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-black/40'>
        <Pressable
          className='absolute inset-0'
          onPress={isLoading ? undefined : onClose}
        />

        <View className='flex-1 items-center justify-center px-6'>
          <View className='w-full max-w-[420px] rounded-xl bg-white p-4 shadow-lg'>
            <View className='flex-row items-start justify-between gap-4'>
              <View className='flex-1'>
                <CustomText type='h4'>{texts.title}</CustomText>

                <CustomText
                  type='body'
                  className='mt-1 text-sm text-neutral-600'
                >
                  {texts.description}
                </CustomText>
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={16}
                disabled={isLoading}
              >
                <FontAwesomeIcon
                  variant='bold'
                  name='close'
                  size={15}
                  color='cinnabar'
                />
              </Pressable>
            </View>

            <View className='mt-4 rounded-xl bg-neutral-50 p-3'>
              <CustomText
                type='body'
                className='text-sm text-neutral-500'
              >
                {texts.currentOffer}
              </CustomText>

              <CustomText
                type='h4'
                className='mt-1 text-cinnabar'
              >
                {formatter.format(currentOfferAmount)}
              </CustomText>
            </View>

            <View className='mt-4'>
              <CustomText
                type='body'
                className='font-semibold'
              >
                {texts.negotiationHistory}
              </CustomText>

              <View className='mt-2 max-h-52 rounded-xl border border-neutral-200 p-3'>
                <ScrollView nestedScrollEnabled>
                  <View className='gap-3'>
                    {sortedProposals.map((proposal) => (
                      <View
                        key={proposal.id}
                        className='flex-row items-center justify-between'
                      >
                        <CustomText type='body'>
                          {proposal.createdBy === OfferActorConst.USER
                            ? texts.you
                            : texts.store}
                        </CustomText>

                        <CustomText
                          type='body'
                          className='font-semibold text-cinnabar'
                        >
                          {formatter.format(proposal.amount)}
                        </CustomText>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View className='mt-4'>
              <CustomText type='body'>{texts.label}</CustomText>

              <TextInput
                value={inputValue}
                onChangeText={handleChange}
                keyboardType='number-pad'
                inputMode='numeric'
                placeholder={String(currentOfferAmount)}
                editable={!isLoading}
                className='mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base'
              />

              {inputValue !== '' && !isValidAmount && (
                <CustomText
                  type='body'
                  className='mt-1 text-xs text-cinnabar'
                >
                  {numericAmount === currentOfferAmount
                    ? texts.sameAmount
                    : texts.invalidAmount}
                </CustomText>
              )}
            </View>

            <View className='mt-4 flex-row gap-3'>
              <Button
                mode='primary'
                className='flex-1'
                textClassName='text-center'
                onPress={handleConfirm}
                disabled={!isValidAmount || isLoading}
                isLoading={isLoading}
              >
                {texts.confirm}
              </Button>

              <Button
                mode='secondary'
                className='flex-1'
                textClassName='text-center'
                onPress={onClose}
                disabled={isLoading}
              >
                {texts.cancel}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
