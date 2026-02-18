import React from 'react';
import { Modal, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useAuctionStartedModal } from '@/context/auction-started-context';

const TEXTS = {
  es: {
    title: '¡Una subasta acaba de comenzar!',
    goToAuction: 'Ir a la subasta en vivo',
    close: 'Cerrar',
  },
  en: {
    title: 'An auction has just started!',
    goToAuction: 'Go to live auction',
    close: 'Close',
  },
};

export function AuctionStartedModal() {
  const { locale } = useTranslation();
  const {
    isAuctionStartedModalOpen,
    closeAuctionStartedAlertModal,
    auctionId,
  } = useAuctionStartedModal();
  const { navigateWithAuth } = useAuthNavigation();
  const texts = TEXTS[locale];

  const handleGoToAuction = () => {
    const target = auctionId;

    closeAuctionStartedAlertModal();

    requestAnimationFrame(() => {
      if (!target) {
        navigateWithAuth('/(tabs)/auctions');
        return;
      }
      navigateWithAuth(`/(tabs)/auctions/live/${target}`);
    });
  };

  return (
    <Modal
      visible={isAuctionStartedModalOpen}
      transparent
      animationType='fade'
      onRequestClose={closeAuctionStartedAlertModal}
    >
      <View className='flex-1 items-center justify-center bg-black/40'>
        <View className='w-11/12 max-w-md rounded-2xl bg-white px-5 py-5'>
          {/* Header */}
          <View>
            <CustomText
              type='h3'
              className='mb-2'
            >
              {texts.title}
            </CustomText>
          </View>

          {/* Footer buttons */}
          <View className='mt-4 gap-3'>
            <Button
              mode='primary'
              onPress={handleGoToAuction}
            >
              {texts.goToAuction}
            </Button>
            <Button
              mode='secondary'
              onPress={closeAuctionStartedAlertModal}
            >
              {texts.close}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
