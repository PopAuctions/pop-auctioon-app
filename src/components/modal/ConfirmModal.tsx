import React, { useState, type ReactNode } from 'react';
import { Modal, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button, ButtonMode } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface ConfirmModalProps<TConfirmResult = void> {
  children: ReactNode;
  onConfirm: () => TConfirmResult | Promise<TConfirmResult>;
  title: string;
  description: string;
  importantMessage?: string;
  mode: ButtonMode;
  isDisabled?: boolean;
}

export function ConfirmModal<TConfirmResult = void>({
  children,
  onConfirm,
  title,
  description,
  importantMessage,
  mode,
  isDisabled = false,
}: ConfirmModalProps<TConfirmResult>) {
  const { t } = useTranslation();
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
        isLoading={confirming}
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
                {title}
              </CustomText>
              <CustomText type='body'>{description}</CustomText>
              {importantMessage && (
                <CustomText
                  type='body'
                  className='text-sm text-cinnabar'
                >
                  {importantMessage}
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
                {t('common.actions.confirm')}
              </Button>

              <Button
                mode='secondary'
                className='w-1/2'
                onPress={closeModal}
                disabled={confirming}
              >
                {t('common.actions.cancel')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
