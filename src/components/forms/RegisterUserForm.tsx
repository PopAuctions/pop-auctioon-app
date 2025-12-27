import { View, Pressable } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { Divider } from '@/components/ui/Divider';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import type { UserRegisterSchemaType } from '@/utils/schemas';
import { getErrorMessage } from '@/utils/form-errors';

interface RegisterUserFormProps {
  control: Control<UserRegisterSchemaType>;
  errors: FieldErrors<UserRegisterSchemaType>;
  isLoading: boolean;
  acceptedTerms: boolean;
  onTermsToggle: () => void;
  onOpenTerms: () => void;
}

export function RegisterUserForm({
  control,
  errors,
  isLoading,
  acceptedTerms,
  onTermsToggle,
  onOpenTerms,
}: RegisterUserFormProps) {
  const { t, locale } = useTranslation();

  return (
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
                {getErrorMessage(errors.name.message, locale)}
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
                {getErrorMessage(errors.lastName.message, locale)}
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
                {getErrorMessage(errors.username.message, locale)}
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
                {getErrorMessage(errors.email.message, locale)}
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
                {getErrorMessage(errors.password.message, locale)}
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
                {getErrorMessage(errors.confirmPassword.message, locale)}
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
                {getErrorMessage(errors.dni.message, locale)}
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
                {getErrorMessage(errors.phoneNumber.message, locale)}
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
          onPress={onTermsToggle}
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
          <Pressable onPress={onOpenTerms}>
            <CustomText
              type='body'
              className='text-cinnabar underline'
            >
              {t('screens.account.termsAndConditions')}
            </CustomText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
