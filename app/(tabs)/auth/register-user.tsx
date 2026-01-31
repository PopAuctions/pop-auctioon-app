import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
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
import { useOpenTerms } from '@/hooks/useOpenTerms';

export default function RegisterUserScreen() {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { signup, isLoading } = useSignup();
  const { handleOpenTerms } = useOpenTerms();
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

      router.push({
        pathname: '/(tabs)/auth/confirm-email',
        params: {
          email: result.email,
        },
      });
    } else if (result.error) {
      callToast({
        variant: 'error',
        description: result.error,
      });
    }
  };

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={[]}
    >
      <ScrollView className='flex-1 px-4 pb-2 pt-4'>
        <View className='w-full md:max-w-[600px] md:self-center'>
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
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
