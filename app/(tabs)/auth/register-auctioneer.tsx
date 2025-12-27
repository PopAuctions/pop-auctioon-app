import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Button } from '@/components/ui/Button';
import { CustomLink } from '@/components/ui/CustomLink';
import { RegisterAuctioneerForm } from '@/components/forms/RegisterAuctioneerForm';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AuctioneerRegisterSchema,
  type AuctioneerRegisterSchemaType,
} from '@/utils/schemas';
import { useSignup } from '@/hooks/auth/useSignup';
import { useToast } from '@/hooks/useToast';
import { APP_USER_ROLES } from '@/constants/user';
import * as Linking from 'expo-linking';

export default function RegisterAuctioneerScreen() {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { signup, isLoading } = useSignup();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuctioneerRegisterSchemaType>({
    resolver: zodResolver(AuctioneerRegisterSchema),
    defaultValues: {
      name: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      dni: '',
      phoneNumber: '',
      profilePicture: '',
      storeName: '',
      webPage: '',
      socialMedia: '',
      address: '',
      town: '',
      province: '',
      country: '',
      postalCode: '',
    },
  });

  const onSubmit = async (data: AuctioneerRegisterSchemaType) => {
    if (!acceptedTerms) {
      callToast({
        variant: 'error',
        description: {
          es: 'Debes aceptar los términos y condiciones',
          en: 'You must accept the terms and conditions',
        },
      });
      return;
    }

    const result = await signup(
      {
        name: data.name,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        dni: data.dni || '',
        phoneNumber: data.phoneNumber || '',
        profilePicture: data.profilePicture || '',
        storeName: data.storeName || '',
        webPage: data.webPage || '',
        socialMedia: data.socialMedia || '',
        address: data.address || '',
        town: data.town || '',
        province: data.province || '',
        country: data.country || '',
        postalCode: data.postalCode || '',
      },
      APP_USER_ROLES.AUCTIONEER,
      locale
    );

    if (result.success && result.email) {
      callToast({
        variant: 'success',
        description: {
          es: 'Subastador creado. Revisa tu email para confirmar tu cuenta.',
          en: 'Auctioneer created. Check your email to confirm your account.',
        },
      });

      router.replace('/(tabs)/auth/login');
    } else if (result.error) {
      callToast({
        variant: 'error',
        description: result.error,
      });
    }
  };

  const handleOpenTerms = async () => {
    const termsUrl = 'https://www.popauction.com/documents/TC-2025-07-14.pdf';
    const supported = await Linking.canOpenURL(termsUrl);

    if (supported) {
      await Linking.openURL(termsUrl);
    } else {
      callToast({
        variant: 'error',
        description: {
          es: 'No se pudo abrir el documento',
          en: 'Could not open document',
        },
      });
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView
        className='flex-1 px-6'
        showsVerticalScrollIndicator={false}
      >
        {/* Formulario */}
        <RegisterAuctioneerForm
          control={control}
          errors={errors}
          isLoading={isLoading}
          acceptedTerms={acceptedTerms}
          onTermsToggle={() => setAcceptedTerms(!acceptedTerms)}
          onOpenTerms={handleOpenTerms}
        />

        {/* Botones */}
        <View className='gap-3 pb-6'>
          <Button
            mode='primary'
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={!acceptedTerms}
          >
            {t('screens.account.createAccount')}
          </Button>

          <CustomLink
            href='/(tabs)/auth/login'
            mode='plainText'
          >
            {t('globals.back')}
          </CustomLink>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
