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
import { AuctioneerEditSchema } from '@/utils/schemas';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/utils/form-errors';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { APP_USER_ROLES } from '@/constants/user';
import type * as z from 'zod';
import { REQUEST_STATUS } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useFetchUserStore } from '@/hooks/components/useFetchUserStore';
import { useUpdateStore } from '@/hooks/pages/store/useUpdateStore';
import { Tooltip } from '@/components/ui/Tooltip';

export default function EditStoreScreen() {
  const { t, locale } = useTranslation();
  const { auth } = useAuth();
  const { callToast } = useToast(locale);
  const { navigateWithAuth } = useAuthNavigation();
  const isSubmittingRef = useRef(false);

  const {
    data: userStoreData,
    status: storeFetchStatus,
    errorMessage: storeFetchError,
  } = useFetchUserStore();
  const {
    updateStore,
    status: updateStatus,
    errorMessage: updateError,
  } = useUpdateStore();

  // Determinar el rol del usuario (por defecto USER)
  const userRole =
    auth.state === 'authenticated' && auth.role
      ? auth.role
      : APP_USER_ROLES.USER;
  const isAuctioneer = userRole === APP_USER_ROLES.AUCTIONEER;

  // React Hook Form con schema dinámico según el rol
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof AuctioneerEditSchema>>({
    resolver: zodResolver(AuctioneerEditSchema),
    defaultValues: {
      address: '',
      town: '',
      province: '',
      country: '',
      postalCode: '',
      webPage: '',
      phoneNumber: '',
      socialMedia: '',
      name: '',
      logo: '',
      legalName: '',
      cif: '',
    },
  });

  // Auto-populate form with store data from hook
  useEffect(() => {
    const formData: any = {};

    formData.address = userStoreData?.address || '';
    formData.town = userStoreData?.town || '';
    formData.province = userStoreData?.province || '';
    formData.country = userStoreData?.country || '';
    formData.postalCode = userStoreData?.postalCode || '';
    formData.webPage = userStoreData?.webPage || '';
    formData.socialMedia = userStoreData?.socialMedia || '';
    formData.name = userStoreData?.name || '';
    formData.phoneNumber = userStoreData?.phoneNumber ?? '';
    formData.cif = userStoreData?.cif || '';
    formData.legalName = userStoreData?.legalName || '';
    formData.logo = userStoreData?.logo || '';

    reset(formData);
  }, [reset, userStoreData]);

  const onSubmit = async (data: z.infer<typeof AuctioneerEditSchema>) => {
    isSubmittingRef.current = true;

    await updateStore({
      ...data,
      oldLogo: userStoreData?.logo ?? '',
    });
  };

  // Handle update result (success or error)
  useEffect(() => {
    if (!isSubmittingRef.current) return;

    if (updateStatus === REQUEST_STATUS.success) {
      callToast({
        variant: 'success',
        description: 'screens.editProfile.updateSuccess',
      });
      navigateWithAuth('/(tabs)/auctioneer');
      isSubmittingRef.current = false;
    } else if (updateStatus === REQUEST_STATUS.error && updateError) {
      callToast({
        variant: 'error',
        description: updateError,
      });
      isSubmittingRef.current = false;
    }
  }, [updateStatus, updateError, locale, callToast, navigateWithAuth]);

  if (!isAuctioneer) {
    return (
      <CustomError
        customMessage={{ es: 'Permiso denegado', en: 'Permission denied' }}
        refreshRoute='/(tabs)/auctioneer/edit'
      />
    );
  }

  // Show loading while fetching user data
  if (storeFetchStatus === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  // Show error if fetch failed or if we don't have user data
  if (storeFetchStatus === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={storeFetchError}
        refreshRoute='/(tabs)/auctioneer/edit'
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
            {/* Store Name Input */}
            <View className='mb-4'>
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
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('screens.editProfile.name')}
                    editable={!isLoading}
                  />
                )}
              />
              {'name' in errors && errors.name && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.name.message, locale)}
                </CustomText>
              )}
            </View>

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
              {'phoneNumber' in errors && errors.phoneNumber && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.phoneNumber.message, locale)}
                </CustomText>
              )}
            </View>

            {/* CIF Input */}
            <View className='mb-4'>
              <View className='mb-2 flex flex-row items-center gap-2'>
                <CustomText
                  type='body'
                  className=''
                >
                  {t('screens.editProfile.cif')}
                </CustomText>
                <Tooltip content={t('screens.editProfile.legalInputs')} />
              </View>
              <Controller
                control={control}
                name='cif'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('screens.editProfile.cif')}
                    editable={false}
                  />
                )}
              />
              {'cif' in errors && errors.cif && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.cif.message, locale)}
                </CustomText>
              )}
            </View>
            {/* legal name Input */}
            <View className='mb-4'>
              <View className='mb-2 flex flex-row items-center gap-2'>
                <CustomText
                  type='body'
                  className=''
                >
                  {t('screens.editProfile.legalName')}
                </CustomText>
                <Tooltip content={t('screens.editProfile.legalInputs')} />
              </View>
              <Controller
                control={control}
                name='legalName'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('screens.editProfile.legalName')}
                    editable={false}
                  />
                )}
              />
              {'legalName' in errors && errors.legalName && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.legalName.message, locale)}
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
                name='logo'
                render={({ field: { onChange, value } }) => (
                  <ImageUploadButton
                    selectedImage={value || null}
                    onImageSelected={onChange}
                    onImageRemoved={() => onChange('')}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.logo && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.logo.message, locale)}
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
