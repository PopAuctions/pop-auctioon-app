import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { CustomLink } from '@/components/ui/CustomLink';
import { RegisterUserForm } from '@/components/forms/RegisterUserForm';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserRegisterSchema,
  type UserRegisterSchemaType,
} from '@/utils/schemas';
import { useSignup } from '@/hooks/auth/useSignup';
import { useToast } from '@/hooks/useToast';
import { APP_USER_ROLES } from '@/constants/user';
import * as Linking from 'expo-linking';

export default function RegisterUserScreen() {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { signup, isLoading } = useSignup();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserRegisterSchemaType>({
    resolver: zodResolver(UserRegisterSchema),
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
    },
  });

  const onSubmit = async (data: UserRegisterSchemaType) => {
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
      },
      APP_USER_ROLES.USER,
      locale
    );

    if (result.success && result.email) {
      callToast({
        variant: 'success',
        description: {
          es: 'Usuario creado. Revisa tu email para confirmar tu cuenta.',
          en: 'User created. Check your email to confirm your account.',
        },
      });

      router.replace('/(tabs)/account');
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
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        className='flex-1'
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* Título */}
        <View className='mb-6'>
          <CustomText
            type='h1'
            className='mb-2 text-center text-cinnabar'
          >
            {t('screens.account.registerFormTitle')}
          </CustomText>
        </View>

        {/* Formulario */}
        <RegisterUserForm
          control={control}
          errors={errors}
          isLoading={isLoading}
          acceptedTerms={acceptedTerms}
          onTermsToggle={() => setAcceptedTerms(!acceptedTerms)}
          onOpenTerms={handleOpenTerms}
        />

        {/* Botones */}
        <View className='mt-4 gap-3'>
          <Button
            onPress={handleSubmit(onSubmit)}
            mode='primary'
            disabled={!acceptedTerms || isLoading}
            isLoading={isLoading}
          >
            <CustomText
              type='body'
              className='text-white'
            >
              {t('screens.account.createAccount')}
            </CustomText>
          </Button>

          <CustomLink
            href='/(tabs)/auth/register'
            mode='secondary'
          >
            {t('globals.back')}
          </CustomLink>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
