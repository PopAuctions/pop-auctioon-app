import React from 'react';
import { Modal, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSignInAlertModal } from '@/context/sign-in-modal-context';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';

const TEXTS = {
  es: {
    title: 'Necesitas iniciar sesión para realizar esta acción',
    description: 'Inicia sesión o crea una cuenta',
    goToSignIn: 'Iniciar sesión',
    goToCreateAccount: 'Crear cuenta',
    close: 'Cerrar',
  },
  en: {
    title: 'You need to be signed in to perform this action',
    description: 'Sign in or create an account',
    goToSignIn: 'Sign in',
    goToCreateAccount: 'Create account',
    close: 'Close',
  },
};

export function SignInAlertModal() {
  const { locale } = useTranslation();
  const { isSignInAlertModalOpen, closeSignInAlertModal } =
    useSignInAlertModal();
  const { navigateWithAuth } = useAuthNavigation();
  const texts = TEXTS[locale];

  const handleGoToSignIn = () => {
    closeSignInAlertModal();
    navigateWithAuth('/(tabs)/auth/login?fromTab=true');
  };

  const handleGoToCreateAccount = () => {
    closeSignInAlertModal();
    navigateWithAuth('/(tabs)/auth/register-user?fromTab=true');
  };

  return (
    <Modal
      visible={isSignInAlertModalOpen}
      transparent
      animationType='fade'
      onRequestClose={closeSignInAlertModal}
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
              className='mb-2'
            >
              {texts.description}
            </CustomText>
          </View>

          {/* Footer buttons */}
          <View className='mt-4 gap-3'>
            {/* Primary actions */}
            <View className='flex-row gap-3'>
              <Button
                onPress={handleGoToSignIn}
                mode='primary'
                className='flex-1'
              >
                {texts.goToSignIn}
              </Button>
              <Button
                onPress={handleGoToCreateAccount}
                mode='primary'
                className='flex-1'
              >
                {texts.goToCreateAccount}
              </Button>
            </View>

            {/* Close */}
            <Button
              mode='secondary'
              onPress={closeSignInAlertModal}
            >
              {texts.close}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
