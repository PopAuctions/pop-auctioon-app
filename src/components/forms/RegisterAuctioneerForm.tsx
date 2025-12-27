import { View, Pressable } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { Divider } from '@/components/ui/Divider';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import type { AuctioneerRegisterSchemaType } from '@/utils/schemas';
import { getErrorMessage } from '@/utils/form-errors';

interface RegisterAuctioneerFormProps {
  control: Control<AuctioneerRegisterSchemaType>;
  errors: FieldErrors<AuctioneerRegisterSchemaType>;
  isLoading: boolean;
  acceptedTerms: boolean;
  onTermsToggle: () => void;
  onOpenTerms: () => void;
}

export function RegisterAuctioneerForm({
  control,
  errors,
  isLoading,
  acceptedTerms,
  onTermsToggle,
  onOpenTerms,
}: RegisterAuctioneerFormProps) {
  const { t, locale } = useTranslation();

  return (
    <View>
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
              disabled={isLoading}
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
              editable={!isLoading}
            />
          )}
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
              editable={!isLoading}
            />
          )}
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
              editable={!isLoading}
            />
          )}
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
              editable={!isLoading}
            />
          )}
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
              placeholder='********'
              value={value}
              onChangeText={onChange}
              secureTextEntry
              autoCapitalize='none'
              editable={!isLoading}
            />
          )}
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
              placeholder='********'
              value={value}
              onChangeText={onChange}
              secureTextEntry
              autoCapitalize='none'
              editable={!isLoading}
            />
          )}
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

      {/* DNI */}
      <View className='mb-4'>
        <CustomText
          type='body'
          className='text-gray-700 mb-2'
        >
          {t('screens.editProfile.dni')} *
        </CustomText>
        <Controller
          control={control}
          name='dni'
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder={t('screens.editProfile.dni')}
              value={value}
              onChangeText={onChange}
              editable={!isLoading}
            />
          )}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.phoneNumber && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.phoneNumber.message, locale)}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.storeName && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.storeName.message, locale)}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.webPage && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.webPage.message, locale)}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.socialMedia && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.socialMedia.message, locale)}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.address && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.address.message, locale)}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.town && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.town.message, locale)}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.province && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.province.message, locale)}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.country && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.country.message, locale)}
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
              editable={!isLoading}
            />
          )}
        />
        {errors.postalCode && (
          <CustomText
            type='bodysmall'
            className='mt-1 text-red-500'
          >
            {getErrorMessage(errors.postalCode.message, locale)}
          </CustomText>
        )}
      </View>

      <Divider className='mb-6' />

      {/* Terms and Conditions */}
      <View className='mb-6 flex-row items-start'>
        <Pressable
          onPress={onTermsToggle}
          disabled={isLoading}
          className='mr-3'
        >
          <View
            className={`h-5 w-5 items-center justify-center rounded border-2 ${
              acceptedTerms
                ? 'border-cinnabar bg-cinnabar'
                : 'border-gray-400 bg-white'
            }`}
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
            type='bodysmall'
            className='text-gray-700'
          >
            {t('screens.account.acceptTerms')}{' '}
          </CustomText>
          <Pressable onPress={onOpenTerms}>
            <CustomText
              type='bodysmall'
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
