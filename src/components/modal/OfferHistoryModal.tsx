import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { euroFormatter } from '@/utils/euroFormatter';
import {
  OfferActorConst,
  type Lang,
  type MyOfferProposal,
} from '@/types/types';

type OfferHistoryPerspective = 'user' | 'store';

interface OfferHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  proposals: MyOfferProposal[];
  locale: Lang;
  perspective?: OfferHistoryPerspective;
}

const TEXTS = {
  es: {
    title: 'Historial de ofertas',
    you: 'Tú',
    buyer: 'Comprador',
    store: 'Tienda',
  },
  en: {
    title: 'Offer history',
    you: 'You',
    buyer: 'Buyer',
    store: 'Store',
  },
} satisfies Record<Lang, Record<string, string>>;

export function OfferHistoryModal({
  visible,
  onClose,
  proposals,
  locale,
  perspective = 'user',
}: OfferHistoryModalProps) {
  const texts = TEXTS[locale];
  const formatter = useMemo(() => euroFormatter(locale), [locale]);

  const sortedProposals = useMemo(
    () =>
      [...proposals].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [proposals]
  );

  const getActorLabel = (createdBy: MyOfferProposal['createdBy']) => {
    if (perspective === 'store') {
      return createdBy === OfferActorConst.AUCTIONEER ? texts.you : texts.buyer;
    }

    return createdBy === OfferActorConst.USER ? texts.you : texts.store;
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
          onPress={onClose}
        />

        <View className='flex-1 items-center justify-center px-6'>
          <View className='w-full max-w-[420px] rounded-xl bg-white p-4 shadow-lg'>
            <View className='flex-row items-center justify-between'>
              <CustomText type='h4'>{texts.title}</CustomText>

              <Pressable
                onPress={onClose}
                hitSlop={16}
              >
                <FontAwesomeIcon
                  variant='bold'
                  name='close'
                  size={15}
                  color='cinnabar'
                />
              </Pressable>
            </View>

            <ScrollView
              className='mt-4 max-h-80'
              nestedScrollEnabled
            >
              <View className='gap-3'>
                {sortedProposals.map((proposal) => (
                  <View
                    key={proposal.id}
                    className='flex-row items-center justify-between rounded-xl bg-neutral-50 px-3 py-3'
                  >
                    <CustomText type='body'>
                      {getActorLabel(proposal.createdBy)}
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
      </View>
    </Modal>
  );
}
