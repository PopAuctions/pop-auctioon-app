import React, { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useGetArticlesByAuctionAmount } from '@/hooks/pages/article/useGetArticlesByAuctionAmount';

const TEXTS = {
  es: {
    title: '¡Tienes artículos por pagar!',
    description:
      'Parece que has ganado algunos artículos. Ve a tu perfil para verlos y completar el pago.',
    goToAuction: 'Ir a mis artículos ganados',
    close: 'Cerrar',
  },
  en: {
    title: 'You have articles to pay!',
    description:
      "It looks like you've won some articles. Go to your profile to see them and complete the payment.",
    goToAuction: 'Go to my won articles',
    close: 'Close',
  },
};

export function WonArticlesModal() {
  const { locale } = useTranslation();
  const { data: articlesWonAmount } = useGetArticlesByAuctionAmount();
  const { navigateWithAuth } = useAuthNavigation();
  const [open, setOpen] = useState(false);
  const texts = TEXTS[locale];

  const handleGoToArticlesWon = () => {
    setOpen(false);
    navigateWithAuth('/(tabs)/account/articles-won?fromTab=true');
  };

  useEffect(() => {
    if (articlesWonAmount && articlesWonAmount > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [articlesWonAmount]);

  return (
    <Modal
      visible={open}
      transparent
      animationType='fade'
      onRequestClose={() => setOpen(false)}
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
            <CustomText
              type='body'
              className='text-slate-600'
            >
              {texts.description}
            </CustomText>
          </View>

          {/* Footer buttons */}
          <View className='mt-4 gap-3'>
            <Button
              mode='primary'
              onPress={handleGoToArticlesWon}
            >
              {texts.goToAuction}
            </Button>
            <Button
              mode='secondary'
              onPress={() => setOpen(false)}
            >
              {texts.close}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
