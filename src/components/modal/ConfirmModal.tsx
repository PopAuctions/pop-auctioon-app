import { Lang, LangMap } from '@/types/types';
import React, { useState, type ReactNode } from 'react';
import { Modal, View } from 'react-native';
import { CustomText } from '../ui/CustomText';
import { Button, ButtonMode } from '../ui/Button';

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

interface ConfirmModalProps {
  children: ReactNode;
  onConfirm: () => void | Promise<void>;
  title: LangMap;
  description: LangMap;
  locale: Lang;
  importantMessage?: LangMap;
  mode: ButtonMode;
}

export const ConfirmModal = ({
  children,
  onConfirm,
  title,
  description,
  locale,
  importantMessage,
  mode,
}: ConfirmModalProps) => {
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
                  className='mt-2 text-sm'
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
};
