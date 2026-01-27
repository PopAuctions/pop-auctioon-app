import { Lang, LangMap } from '@/types/types';
import React, { useState, type ReactNode } from 'react';
import { Modal, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button, ButtonMode } from '@/components/ui/Button';

const TEXTS = {
  es: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },
  en: {
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
};

interface ConfirmModalProps<TConfirmResult = void> {
  children: ReactNode;
  onConfirm: () => TConfirmResult | Promise<TConfirmResult>;
  title: LangMap;
  description: LangMap;
  locale: Lang;
  importantMessage?: LangMap;
  mode: ButtonMode;
  isDisabled?: boolean;
}

export function ConfirmModal<TConfirmResult = void>({
  children,
  onConfirm,
  title,
  description,
  locale,
  importantMessage,
  mode,
  isDisabled = false,
}: ConfirmModalProps<TConfirmResult>) {
  const [visible, setVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const openModal = () => setVisible(true);
  const closeModal = () => {
    if (!confirming) setVisible(false);
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await onConfirm();
      setVisible(false);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <Button
        mode={mode}
        onPress={openModal}
        size='small'
        disabled={confirming || isDisabled}
        textClassName='text-center'
      >
        {children}
      </Button>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType='fade'
        onRequestClose={closeModal}
      >
        <View className='flex-1 items-center justify-center bg-black/40'>
          <View className='w-11/12 max-w-md rounded-2xl bg-white px-5 py-5'>
            {/* Header */}
            <View className='mb-4'>
              <CustomText
                type='h3'
                className='mb-2'
              >
                {title[locale]}
              </CustomText>
              <CustomText type='body'>{description[locale]}</CustomText>
              {importantMessage && (
                <CustomText
                  type='body'
                  className='text-sm text-cinnabar'
                >
                  {importantMessage[locale]}
                </CustomText>
              )}
            </View>

            {/* Footer buttons */}
            <View className='mt-4 flex flex-row gap-4'>
              <Button
                mode='primary'
                className='w-1/2'
                onPress={handleConfirm}
                disabled={confirming}
                isLoading={confirming}
              >
                {TEXTS[locale].confirm}
              </Button>

              <Button
                mode='secondary'
                className='w-1/2'
                onPress={closeModal}
                disabled={confirming}
              >
                {TEXTS[locale].cancel}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
