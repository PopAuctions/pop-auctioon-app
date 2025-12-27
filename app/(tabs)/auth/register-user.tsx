import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { Divider } from '@/components/ui/Divider';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserRegisterSchema,
  type UserRegisterSchemaType,
} from '@/utils/schemas';
import { useSignup } from '@/hooks/auth/useSignup';
import { useToast } from '@/hooks/useToast';
import { APP_USER_ROLES } from '@/constants/user';
import { CustomLink } from '@/components/ui/CustomLink';
import * as Linking from 'expo-linking';

// Helper para parsear errores bilingües
const parseErrorMessage = (
  message: string | undefined,
  locale: 'es' | 'en'
): string => {
  if (!message) return '';
  try {
    const parsed = JSON.parse(message);
    return parsed[locale] || message;
  } catch {
    return message;
  }
};

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

      // Navegar a pantalla de confirmación de email
      router.replace('/(tabs)/auth/login');
    } else if (result.error) {
      callToast({
        variant: 'error',
        description: result.error,
      });
    }
  };

  const handleOpenTerms = async () => {
    // TODO: Cambiar URL cuando tengamos el PDF de términos
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
        <View className='gap-4'>
          {/* Nombre */}
          <Controller
            control={control}
            name='name'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('screens.editProfile.name')} *
                </CustomText>
                <Input
                  placeholder={t('screens.editProfile.name')}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
                {errors.name && (
                  <CustomText
                    type='bodysmall'
                    className='mt-1 text-red-500'
                  >
                    {parseErrorMessage(errors.name.message, locale)}
                  </CustomText>
                )}
              </View>
            )}
          />

          {/* Apellido */}
          <Controller
            control={control}
            name='lastName'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('screens.editProfile.lastName')} *
                </CustomText>
                <Input
                  placeholder={t('screens.editProfile.lastName')}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
                {errors.lastName && (
                  <CustomText
                    type='bodysmall'
                    className='mt-1 text-red-500'
                  >
                    {parseErrorMessage(errors.lastName.message, locale)}
                  </CustomText>
                )}
              </View>
            )}
          />

          {/* Username */}
          <Controller
            control={control}
            name='username'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('screens.editProfile.username')} *
                </CustomText>
                <Input
                  placeholder={t('screens.editProfile.username')}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                  autoCapitalize='none'
                />
                {errors.username && (
                  <CustomText
                    type='bodysmall'
                    className='mt-1 text-red-500'
                  >
                    {parseErrorMessage(errors.username.message, locale)}
                  </CustomText>
                )}
              </View>
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('loginPage.email')} *
                </CustomText>
                <Input
                  placeholder={t('loginPage.email')}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />
                {errors.email && (
                  <CustomText
                    type='bodysmall'
                    className='mt-1 text-red-500'
                  >
                    {parseErrorMessage(errors.email.message, locale)}
                  </CustomText>
                )}
              </View>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name='password'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('loginPage.password')} *
                </CustomText>
                <Input
                  placeholder='********'
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                  secureTextEntry
                />
                {errors.password && (
                  <CustomText
                    type='bodysmall'
                    className='mt-1 text-red-500'
                  >
                    {parseErrorMessage(errors.password.message, locale)}
                  </CustomText>
                )}
              </View>
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name='confirmPassword'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('screens.account.confirmPassword')} *
                </CustomText>
                <Input
                  placeholder='********'
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                  secureTextEntry
                />
                {errors.confirmPassword && (
                  <CustomText
                    type='bodysmall'
                    className='mt-1 text-red-500'
                  >
                    {parseErrorMessage(errors.confirmPassword.message, locale)}
                  </CustomText>
                )}
              </View>
            )}
          />

          {/* DNI (opcional) */}
          <Controller
            control={control}
            name='dni'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('screens.editProfile.dni')}
                </CustomText>
                <Input
                  placeholder={t('screens.editProfile.dni')}
                  value={value || ''}
                  onChangeText={onChange}
                  editable={!isLoading}
                  autoCapitalize='characters'
                />
                {errors.dni && (
                  <CustomText
                    type='bodysmall'
                    className='mt-1 text-red-500'
                  >
                    {parseErrorMessage(errors.dni.message, locale)}
                  </CustomText>
                )}
              </View>
            )}
          />

          {/* Phone Number (opcional) */}
          <Controller
            control={control}
            name='phoneNumber'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('screens.editProfile.phoneNumber')}
                </CustomText>
                <Input
                  placeholder='+34 600 000 000'
                  value={value || ''}
                  onChangeText={onChange}
                  editable={!isLoading}
                  keyboardType='phone-pad'
                />
                <CustomText
                  type='bodysmall'
                  className='text-gray-500 mt-1'
                >
                  {t('screens.editProfile.includeCountryCode')}
                </CustomText>
                {errors.phoneNumber && (
                  <CustomText
                    type='bodysmall'
                    className='mt-1 text-red-500'
                  >
                    {parseErrorMessage(errors.phoneNumber.message, locale)}
                  </CustomText>
                )}
              </View>
            )}
          />

          {/* Profile Picture (opcional) */}
          <Controller
            control={control}
            name='profilePicture'
            render={({ field: { onChange, value } }) => (
              <View>
                <CustomText
                  type='h4'
                  className='mb-2'
                >
                  {t('screens.account.uploadImage')}
                </CustomText>
                <ImageUploadButton
                  selectedImage={value || null}
                  onImageSelected={onChange}
                  onImageRemoved={() => onChange('')}
                  disabled={isLoading}
                />
                <CustomText
                  type='bodysmall'
                  className='text-gray-500 mt-1'
                >
                  {t('screens.account.imageFormats')}
                </CustomText>
              </View>
            )}
          />

          <Divider />

          {/* Términos y condiciones */}
          <View className='flex-row items-start'>
            <Pressable
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={isLoading}
              className='mr-2 mt-1'
            >
              <View
                className={`h-5 w-5 rounded border-2 ${
                  acceptedTerms
                    ? 'border-cinnabar bg-cinnabar'
                    : 'border-gray-400 bg-white'
                } items-center justify-center`}
              >
                {acceptedTerms && (
                  <CustomText
                    type='body'
                    className='text-xs text-white'
                  >
                    ✓
                  </CustomText>
                )}
              </View>
            </Pressable>
            <View className='flex-1 flex-row flex-wrap'>
              <CustomText
                type='body'
                className='text-gray-700'
              >
                {t('screens.account.acceptTerms')}{' '}
              </CustomText>
              <Pressable onPress={handleOpenTerms}>
                <CustomText
                  type='body'
                  className='text-cinnabar underline'
                >
                  {t('screens.account.termsAndConditions')}
                </CustomText>
              </Pressable>
            </View>
          </View>

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
