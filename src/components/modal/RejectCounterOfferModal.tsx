import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import type { Lang } from '@/types/types';

interface RejectCounterOfferModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  locale: Lang;
}

const TEXTS = {
  es: {
    title: 'Rechazar contraoferta',
    description:
      '¿Estás seguro de que quieres rechazar esta contraoferta? La negociación se cerrará y esta acción no se puede deshacer.',
    confirm: 'Rechazar contraoferta',
    cancel: 'Cancelar',
  },
  en: {
    title: 'Reject counter-offer',
    description:
      'Are you sure you want to reject this counter-offer? The negotiation will be closed and this action cannot be undone.',
    confirm: 'Reject counter-offer',
    cancel: 'Cancel',
  },
} satisfies Record<Lang, Record<string, string>>;

export function RejectCounterOfferModal({
  visible,
  onClose,
  onConfirm,
  locale,
}: RejectCounterOfferModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const texts = TEXTS[locale];

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      const success = await onConfirm();

      if (success) {
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

            <View className='mt-5 flex-row gap-3'>
              <Button
                mode='primary'
                className='flex-1'
                textClassName='text-center'
                onPress={handleConfirm}
                disabled={isLoading}
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
