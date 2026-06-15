import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserEditSchema } from '@/utils/schemas';
import { getErrorMessage } from '@/utils/form-errors';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { useUpdateProfile } from '@/hooks/pages/user/useUpdateProfile';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import type * as z from 'zod';
import { REQUEST_STATUS } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';

export default function EditProfileScreen() {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { navigateWithAuth } = useAuthNavigation();
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof UserEditSchema>>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      name: '',
      lastName: '',
      username: '',
      phoneNumber: '',
      profilePicture: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof UserEditSchema>) => {
    isSubmittingRef.current = true;

    // Call updateProfile with oldProfilePicture and oldPhoneNumber
    await updateProfile({
      ...data,
      oldProfilePicture: currentUserData?.profilePicture || '',
      oldPhoneNumber: currentUserData?.phoneNumber || '',
    });
  };

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

      reset(formData);
    }
  }, [currentUserData, reset]);

  // Handle update result (success or error)
  useEffect(() => {
    if (!isSubmittingRef.current) return;

    if (updateStatus === REQUEST_STATUS.success) {
      callToast({
        variant: 'success',
        description: 'screens.editProfile.updateSuccess',
      });
      navigateWithAuth('/(tabs)/account');
      isSubmittingRef.current = false;
    } else if (updateStatus === REQUEST_STATUS.error && updateError) {
      callToast({
        variant: 'error',
        description: updateError,
      });
      isSubmittingRef.current = false;
    }
  }, [updateStatus, updateError, locale, callToast, navigateWithAuth]);

  // Show loading while fetching user data
  if (fetchStatus === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  // Show error if fetch failed or if we don't have user data
  if (fetchStatus === REQUEST_STATUS.error || !currentUserData) {
    return (
      <CustomError
        customMessage={fetchError}
        refreshRoute='/(tabs)/account/edit-profile'
      />
    );
  }

  // Compute loading state for form controls
  const isLoading = updateStatus === REQUEST_STATUS.loading;

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView className='flex-1'>
        <View className='p-6 md:px-0'>
          <View className='w-full md:max-w-[700px] md:self-center'>
            {/* Header */}
            <CustomText
              type='subtitle'
              className='mb-4 text-cinnabar'
            >
              {t('screens.editProfile.userInfo')}
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
                {t('screens.editProfile.phoneNumber')}
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

            {/* Upload Image Section */}
            <View className='mb-6'>
              <CustomText
                type='body'
                className='mb-3 text-black'
              >
                {t('screens.editProfile.editImage')}
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

            {/* Espacio adicional al final */}
            <View className='h-8' />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
