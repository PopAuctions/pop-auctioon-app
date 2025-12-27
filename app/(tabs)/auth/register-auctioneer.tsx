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
  AuctioneerRegisterSchema,
  type AuctioneerRegisterSchemaType,
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

      // Navegar a login
      router.replace('/(tabs)/auth/login');
    } else if (result.error) {
      callToast({
        variant: 'error',
        description: result.error,
      });
    }
  };

  const handleOpenTerms = async () => {
    const termsUrl = 'https://example.com/terms.pdf'; // TODO: Reemplazar con URL real
    const canOpen = await Linking.canOpenURL(termsUrl);
    if (canOpen) {
      await Linking.openURL(termsUrl);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView
        className='flex-1 px-6'
        showsVerticalScrollIndicator={false}
      >
        <View className='py-6'>
          {/* Title */}
          <CustomText
            type='h3'
            className='text-gray-900 mb-2 text-center'
          >
            {t('screens.account.registerAsAuctioneer')}
          </CustomText>

          <CustomText
            type='bodysmall'
            className='text-gray-600 mb-8 text-center'
          >
            {t('screens.account.createAccount')}
          </CustomText>

          {/* Profile Picture */}
          <View className='mb-6'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.uploadImage')}
            </CustomText>
            <Controller
              control={control}
              name='profilePicture'
              render={({ field: { onChange, value } }) => (
                <ImageUploadButton
                  selectedImage={value || null}
                  onImageSelected={onChange}
                  onImageRemoved={() => onChange('')}
                />
              )}
            />
            <CustomText
              type='bodysmall'
              className='text-gray-500 mt-1'
            >
              {t('screens.account.imageFormats')}
            </CustomText>
          </View>

          <Divider className='mb-6' />

          {/* Name */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.name')} *
            </CustomText>
            <Controller
              control={control}
              name='name'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.name')}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize='words'
                />
              )}
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

          {/* Last Name */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.lastName')} *
            </CustomText>
            <Controller
              control={control}
              name='lastName'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.lastName')}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize='words'
                />
              )}
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

          {/* Username */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.username')} *
            </CustomText>
            <Controller
              control={control}
              name='username'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.username')}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize='none'
                />
              )}
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

          {/* Email */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('loginPage.email')} *
            </CustomText>
            <Controller
              control={control}
              name='email'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('loginPage.email')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />
              )}
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

          {/* Password */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('loginPage.password')} *
            </CustomText>
            <Controller
              control={control}
              name='password'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('loginPage.password')}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoCapitalize='none'
                />
              )}
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

          {/* Confirm Password */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.account.confirmPassword')} *
            </CustomText>
            <Controller
              control={control}
              name='confirmPassword'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.account.confirmPassword')}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoCapitalize='none'
                />
              )}
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

          {/* DNI */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.dni')}
            </CustomText>
            <Controller
              control={control}
              name='dni'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.dni')}
                  value={value}
                  onChangeText={onChange}
                />
              )}
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

          {/* Phone Number */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.phoneNumber')} *
            </CustomText>
            <CustomText
              type='bodysmall'
              className='text-gray-500 mb-2'
            >
              {t('screens.editProfile.includeCountryCode')}
            </CustomText>
            <Controller
              control={control}
              name='phoneNumber'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='+34 600 000 000'
                  value={value}
                  onChangeText={onChange}
                  keyboardType='phone-pad'
                />
              )}
            />
            {errors.phoneNumber && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.phoneNumber.message, locale)}
              </CustomText>
            )}
          </View>

          <Divider className='mb-6' />

          {/* Store Name */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.storeName')} *
            </CustomText>
            <Controller
              control={control}
              name='storeName'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.storeName')}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.storeName && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.storeName.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Web Page */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.webPage')} *
            </CustomText>
            <CustomText
              type='bodysmall'
              className='text-gray-500 mb-2'
            >
              {t('screens.editProfile.keepUrlProtocol')}
            </CustomText>
            <Controller
              control={control}
              name='webPage'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='https://example.com'
                  value={value}
                  onChangeText={onChange}
                  keyboardType='url'
                  autoCapitalize='none'
                />
              )}
            />
            {errors.webPage && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.webPage.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Social Media */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.socialMedia')} *
            </CustomText>
            <CustomText
              type='bodysmall'
              className='text-gray-500 mb-2'
            >
              {t('screens.editProfile.keepUrlProtocol')}
            </CustomText>
            <Controller
              control={control}
              name='socialMedia'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='https://instagram.com/username'
                  value={value}
                  onChangeText={onChange}
                  keyboardType='url'
                  autoCapitalize='none'
                />
              )}
            />
            {errors.socialMedia && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.socialMedia.message, locale)}
              </CustomText>
            )}
          </View>

          <Divider className='mb-6' />

          {/* Address */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.address')} *
            </CustomText>
            <Controller
              control={control}
              name='address'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.address')}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.address && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.address.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Town */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.town')} *
            </CustomText>
            <Controller
              control={control}
              name='town'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.town')}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.town && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.town.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Province */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.province')} *
            </CustomText>
            <Controller
              control={control}
              name='province'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.province')}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.province && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.province.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Country */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.country')} *
            </CustomText>
            <Controller
              control={control}
              name='country'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.country')}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.country && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.country.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Postal Code */}
          <View className='mb-6'>
            <CustomText
              type='body'
              className='text-gray-700 mb-2'
            >
              {t('screens.editProfile.postalCode')} *
            </CustomText>
            <Controller
              control={control}
              name='postalCode'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t('screens.editProfile.postalCode')}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.postalCode && (
              <CustomText
                type='bodysmall'
                className='mt-1 text-red-500'
              >
                {parseErrorMessage(errors.postalCode.message, locale)}
              </CustomText>
            )}
          </View>

          <Divider className='mb-6' />

          {/* Terms and Conditions */}
          <Pressable
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            className='mb-6 flex-row items-start'
          >
            <View
              className={`mr-3 h-5 w-5 items-center justify-center rounded border-2 ${
                acceptedTerms
                  ? 'border-cinnabar bg-cinnabar'
                  : 'border-gray-400 bg-white'
              }`}
            >
              {acceptedTerms && (
                <CustomText
                  type='body'
                  className='text-white'
                >
                  ✓
                </CustomText>
              )}
            </View>
            <View className='flex-1'>
              <CustomText
                type='bodysmall'
                className='text-gray-700'
              >
                {t('screens.account.acceptTerms')}{' '}
                <CustomText
                  type='bodysmall'
                  className='text-cinnabar'
                  onPress={handleOpenTerms}
                >
                  {t('screens.account.termsAndConditions')}
                </CustomText>
              </CustomText>
            </View>
          </Pressable>

          {/* Submit Button */}
          <Button
            mode='primary'
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={!acceptedTerms}
          >
            {t('screens.account.createAccount')}
          </Button>

          {/* Back to Login */}
          <View className='mt-6 items-center'>
            <CustomLink
              href='/(tabs)/auth/login'
              mode='plainText'
            >
              {t('globals.back')}
            </CustomLink>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
