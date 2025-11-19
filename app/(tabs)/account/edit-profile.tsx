import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserEditSchema, AuctioneerEditSchema } from '@/utils/schemas';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/utils/form-errors';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useUpdateProfile } from '@/hooks/pages/user/useUpdateProfile';
import { Loading } from '@/components/ui/Loading';
import { APP_USER_ROLES } from '@/constants/user';
import type * as z from 'zod';
import { REQUEST_STATUS } from '@/constants';

export default function EditProfileScreen() {
  const { t, locale } = useTranslation();
  const { auth } = useAuth();
  const isSubmittingRef = useRef(false);

  // Usar los nuevos hooks
  const {
    data: currentUserData,
    status: fetchStatus,
    errorMessage: fetchError,
  } = useGetCurrentUser();
  const {
    updateProfile,
    status: updateStatus,
    errorMessage: updateError,
  } = useUpdateProfile();

  // Determinar el rol del usuario (por defecto USER)
  const userRole =
    auth.state === 'authenticated' && auth.role
      ? auth.role
      : APP_USER_ROLES.USER;
  const schema =
    userRole === APP_USER_ROLES.AUCTIONEER
      ? AuctioneerEditSchema
      : UserEditSchema;

  // React Hook Form con schema dinámico según el rol
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<
    z.infer<typeof UserEditSchema> | z.infer<typeof AuctioneerEditSchema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      lastName: '',
      username: '',
      phoneNumber: '',
      profilePicture: '',
      ...(userRole === APP_USER_ROLES.AUCTIONEER && {
        address: '',
        town: '',
        province: '',
        country: '',
        postalCode: '',
        webPage: '',
        socialMedia: '',
        storeName: '',
      }),
    },
  });

  // Auto-populate form with user data from hook
  useEffect(() => {
    if (currentUserData) {
      const formData: any = {
        name: currentUserData.name || '',
        lastName: currentUserData.lastName || '',
        username: currentUserData.username || '',
        phoneNumber: currentUserData.phoneNumber || '',
        profilePicture: currentUserData.profilePicture || '',
      };

      // Agregar campos de AUCTIONEER si aplica
      if (userRole === APP_USER_ROLES.AUCTIONEER) {
        formData.address = currentUserData.address || '';
        formData.town = currentUserData.town || '';
        formData.province = currentUserData.province || '';
        formData.country = currentUserData.country || '';
        formData.postalCode = currentUserData.postalCode || '';
        formData.webPage = currentUserData.webPage || '';
        formData.socialMedia = currentUserData.socialMedia || '';
        formData.storeName = currentUserData.storeName || '';
      }

      reset(formData);
    }
  }, [currentUserData, userRole, reset]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchStatus === 'error') {
      console.error('ERROR_LOAD_USER_DATA', fetchError);
      // TODO: Show toast with fetchError[locale]
      router.back();
    }
  }, [fetchStatus, fetchError, locale]);

  // Handle update result (success or error)
  useEffect(() => {
    if (!isSubmittingRef.current) return;

    if (updateStatus === 'success') {
      console.log('SUCCESS_UPDATE_PROFILE');
      // TODO: Show success toast
      router.back();
      isSubmittingRef.current = false;
    } else if (updateStatus === 'error' && updateError) {
      console.error('ERROR_UPDATE_PROFILE', updateError);
      // TODO: Show error toast with updateError[locale]
      router.back();
      isSubmittingRef.current = false;
    }
  }, [updateStatus, updateError, locale]);

  const onSubmit = async (
    data: z.infer<typeof UserEditSchema> | z.infer<typeof AuctioneerEditSchema>
  ) => {
    isSubmittingRef.current = true;

    // Call updateProfile with oldProfilePicture and oldPhoneNumber
    await updateProfile({
      ...data,
      oldProfilePicture: currentUserData?.profilePicture || '',
      oldPhoneNumber: currentUserData?.phoneNumber || '',
    });
  };

  const handleBack = () => {
    router.back();
  };

  // Show loading while fetching user data
  if (fetchStatus === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  // Compute loading state for form controls
  const isLoading = updateStatus === REQUEST_STATUS.loading;

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView className='flex-1'>
        <View className='p-6'>
          {/* Header */}
          <CustomText
            type='h1'
            className='mb-4 text-center text-cinnabar'
          >
            {t('screens.editProfile.title')}
          </CustomText>

          {/* Name and Last Name Row */}
          <View className='mb-4 flex-row gap-3'>
            {/* Name Input */}
            <View className='flex-1'>
              <CustomText
                type='body'
                className='mb-2 '
              >
                {t('screens.editProfile.name')}*
              </CustomText>
              <Controller
                control={control}
                name='name'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('screens.editProfile.name')}
                    editable={!isLoading}
                  />
                )}
              />
              {errors.name && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.name.message, locale)}
                </CustomText>
              )}
            </View>

            {/* Last Name Input */}
            <View className='flex-1'>
              <CustomText
                type='body'
                className='mb-2 '
              >
                {t('screens.editProfile.lastName')}*
              </CustomText>
              <Controller
                control={control}
                name='lastName'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('screens.editProfile.lastName')}
                    editable={!isLoading}
                  />
                )}
              />
              {errors.lastName && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.lastName.message, locale)}
                </CustomText>
              )}
            </View>
          </View>

          {/* Username Input */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2 '
            >
              {t('screens.editProfile.username')}*
            </CustomText>
            <Controller
              control={control}
              name='username'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.editProfile.username')}
                  editable={!isLoading}
                />
              )}
            />
            {errors.username && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.username.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Phone Number Input */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2 '
            >
              {t('screens.editProfile.phoneNumber')}*
            </CustomText>
            <Controller
              control={control}
              name='phoneNumber'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.editProfile.phoneNumber')}
                  keyboardType='phone-pad'
                  editable={!isLoading}
                />
              )}
            />
            {errors.phoneNumber && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.phoneNumber.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Campos adicionales para AUCTIONEER */}
          {userRole === 'AUCTIONEER' && (
            <>
              {/* Store Name Input */}
              <View className='mb-4'>
                <CustomText
                  type='body'
                  className='mb-2 '
                >
                  {t('screens.editProfile.storeName')}*
                </CustomText>
                <Controller
                  control={control}
                  name='storeName'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('screens.editProfile.storeName')}
                      editable={!isLoading}
                    />
                  )}
                />
                {'storeName' in errors && errors.storeName && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {getErrorMessage(errors.storeName.message, locale)}
                  </CustomText>
                )}
              </View>

              {/* Web Page Input */}
              <View className='mb-4'>
                <CustomText
                  type='body'
                  className='mb-2 '
                >
                  {t('screens.editProfile.webPage')}*
                </CustomText>
                <Controller
                  control={control}
                  name='webPage'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('screens.editProfile.webPage')}
                      keyboardType='url'
                      autoCapitalize='none'
                      editable={!isLoading}
                    />
                  )}
                />
                <CustomText
                  type='body'
                  className='text-gray-500 mt-1 text-xs'
                >
                  {t('screens.editProfile.keepUrlProtocol')}
                </CustomText>
                {'webPage' in errors && errors.webPage && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {getErrorMessage(errors.webPage.message, locale)}
                  </CustomText>
                )}
              </View>

              {/* Social Media Input */}
              <View className='mb-4'>
                <CustomText
                  type='body'
                  className='mb-2 '
                >
                  {t('screens.editProfile.socialMedia')}*
                </CustomText>
                <Controller
                  control={control}
                  name='socialMedia'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('screens.editProfile.socialMedia')}
                      keyboardType='url'
                      autoCapitalize='none'
                      editable={!isLoading}
                    />
                  )}
                />
                <CustomText
                  type='body'
                  className='text-gray-500 mt-1 text-xs'
                >
                  {t('screens.editProfile.keepUrlProtocol')}
                </CustomText>
                {'socialMedia' in errors && errors.socialMedia && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {getErrorMessage(errors.socialMedia.message, locale)}
                  </CustomText>
                )}
              </View>

              {/* Address Input */}
              <View className='mb-4'>
                <CustomText
                  type='body'
                  className='mb-2 '
                >
                  {t('screens.editProfile.address')}*
                </CustomText>
                <Controller
                  control={control}
                  name='address'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('screens.editProfile.address')}
                      editable={!isLoading}
                    />
                  )}
                />
                {'address' in errors && errors.address && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {getErrorMessage(errors.address.message, locale)}
                  </CustomText>
                )}
              </View>

              {/* Town and Province Row */}
              <View className='mb-4 flex-row gap-3'>
                {/* Town Input */}
                <View className='flex-1'>
                  <CustomText
                    type='body'
                    className='mb-2 '
                  >
                    {t('screens.editProfile.town')}*
                  </CustomText>
                  <Controller
                    control={control}
                    name='town'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('screens.editProfile.town')}
                        editable={!isLoading}
                      />
                    )}
                  />
                  {'town' in errors && errors.town && (
                    <CustomText
                      type='error'
                      className='mt-1'
                    >
                      {getErrorMessage(errors.town.message, locale)}
                    </CustomText>
                  )}
                </View>

                {/* Province Input */}
                <View className='flex-1'>
                  <CustomText
                    type='body'
                    className='mb-2 '
                  >
                    {t('screens.editProfile.province')}*
                  </CustomText>
                  <Controller
                    control={control}
                    name='province'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('screens.editProfile.province')}
                        editable={!isLoading}
                      />
                    )}
                  />
                  {'province' in errors && errors.province && (
                    <CustomText
                      type='error'
                      className='mt-1'
                    >
                      {getErrorMessage(errors.province.message, locale)}
                    </CustomText>
                  )}
                </View>
              </View>

              {/* Country and Postal Code Row */}
              <View className='mb-4 flex-row gap-3'>
                {/* Country Input */}
                <View className='flex-1'>
                  <CustomText
                    type='body'
                    className='mb-2 '
                  >
                    {t('screens.editProfile.country')}*
                  </CustomText>
                  <Controller
                    control={control}
                    name='country'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('screens.editProfile.country')}
                        editable={!isLoading}
                      />
                    )}
                  />
                  {'country' in errors && errors.country && (
                    <CustomText
                      type='error'
                      className='mt-1'
                    >
                      {getErrorMessage(errors.country.message, locale)}
                    </CustomText>
                  )}
                </View>

                {/* Postal Code Input */}
                <View className='flex-1'>
                  <CustomText
                    type='body'
                    className='mb-2 '
                  >
                    {t('screens.editProfile.postalCode')}*
                  </CustomText>
                  <Controller
                    control={control}
                    name='postalCode'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('screens.editProfile.postalCode')}
                        editable={!isLoading}
                      />
                    )}
                  />
                  {'postalCode' in errors && errors.postalCode && (
                    <CustomText
                      type='error'
                      className='mt-1'
                    >
                      {getErrorMessage(errors.postalCode.message, locale)}
                    </CustomText>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Upload Image Section */}
          <View className='mb-6'>
            <CustomText
              type='body'
              className='mb-3 text-black'
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
            {errors.profilePicture && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.profilePicture.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Action Buttons */}
          <View className='mb-4'>
            <Button
              mode='primary'
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('screens.editProfile.update')}
            </Button>
          </View>

          {/* Back Button */}
          <View className='mb-4'>
            <Button
              mode='secondary'
              onPress={handleBack}
              disabled={isLoading}
            >
              {t('screens.editProfile.back')}
            </Button>
          </View>

          {/* Espacio adicional al final */}
          <View className='h-8' />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
