import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserEditSchema, AuctioneerEditSchema } from '@/utils/schemas';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/utils/form-errors';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type * as z from 'zod';

export default function EditProfileScreen() {
  const { t, locale } = useTranslation();
  const { auth } = useAuth();
  const { securePost } = useSecureApi();
  const [loading, setLoading] = useState(false);

  // Determinar el rol del usuario (por defecto USER)
  const userRole =
    auth.state === 'authenticated' && auth.role ? auth.role : 'USER';
  const schema =
    userRole === 'AUCTIONEER' ? AuctioneerEditSchema : UserEditSchema;

  // TODO: Obtener datos reales del usuario desde Supabase
  const currentUser = {
    name: 'Rodrigo',
    lastName: 'Samayoa',
    username: 'rodsamayoa',
    phoneNumber: '+34647312818',
    profilePicture: '',
    ...(userRole === 'AUCTIONEER' && {
      address: 'zona 16',
      town: 'guatemala',
      province: 'Guate',
      country: 'Guatemala',
      postalCode: '01016',
      webPage: 'https://rod.com',
      socialMedia: 'https://rod.com',
      storeName: 'Rod Store',
    }),
  };

  // React Hook Form con schema dinámico según el rol
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.infer<typeof UserEditSchema> | z.infer<typeof AuctioneerEditSchema>
  >({
    resolver: zodResolver(schema),
    defaultValues: currentUser,
  });

  const onSubmit = async (
    data: z.infer<typeof UserEditSchema> | z.infer<typeof AuctioneerEditSchema>
  ) => {
    setLoading(true);

    try {
      // Si hay imagen, usar FormData, si no, usar JSON
      const hasImage = data.profilePicture && data.profilePicture !== '';

      if (hasImage) {
        // Preparar FormData con todos los campos
        const formData = new FormData();

        formData.append('username', data.username);
        formData.append('name', data.name);
        formData.append('lastName', data.lastName);
        formData.append('phoneNumber', data.phoneNumber || '');

        // Campos específicos para AUCTIONEER
        if ('storeName' in data) {
          formData.append('storeName', data.storeName || '');
          formData.append('webPage', data.webPage || '');
          formData.append('socialMedia', data.socialMedia || '');
          formData.append('address', data.address || '');
          formData.append('town', data.town || '');
          formData.append('province', data.province || '');
          formData.append('country', data.country || '');
          formData.append('postalCode', data.postalCode || '');
        }

        formData.append('oldProfilePicture', currentUser.profilePicture || '');
        formData.append('oldPhoneNumber', currentUser.phoneNumber || '');

        // Agregar imagen si existe
        if (data.profilePicture) {
          // Extraer información de la URI de la imagen
          const uriParts = data.profilePicture.split('.');
          const fileType = uriParts[uriParts.length - 1];

          formData.append('profilePicture', {
            uri: data.profilePicture,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        // Llamar endpoint con FormData
        const response = await securePost(
          SECURE_ENDPOINTS.USER.EDIT_INFO,
          formData,
          {
            timeout: 30000, // 30 segundos para subir imagen
          }
        );

        if (response.error) {
          Alert.alert(
            t('commonActions.error'),
            response.error ||
              (locale === 'es'
                ? 'Error actualizando perfil'
                : 'Error updating profile')
          );
          return;
        }

        if (response.data) {
          Alert.alert(
            t('commonActions.ok'),
            locale === 'es' ? 'Perfil actualizado' : 'Profile updated'
          );
          router.back();
        }
      } else {
        // Enviar JSON simple (sin imagen)
        const payload = {
          username: data.username,
          name: data.name,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || '',
          oldProfilePicture: currentUser.profilePicture || '',
          oldPhoneNumber: currentUser.phoneNumber || '',
          // Campos específicos para AUCTIONEER
          ...('storeName' in data && {
            storeName: data.storeName || '',
            webPage: data.webPage || '',
            socialMedia: data.socialMedia || '',
            address: data.address || '',
            town: data.town || '',
            province: data.province || '',
            country: data.country || '',
            postalCode: data.postalCode || '',
          }),
        };

        const response = await securePost(
          SECURE_ENDPOINTS.USER.EDIT_INFO,
          payload
        );

        if (response.error) {
          Alert.alert(
            t('commonActions.error'),
            response.error ||
              (locale === 'es'
                ? 'Error actualizando perfil'
                : 'Error updating profile')
          );
          return;
        }

        if (response.data) {
          Alert.alert(
            t('commonActions.ok'),
            locale === 'es' ? 'Perfil actualizado' : 'Profile updated'
          );
          router.back();
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        t('commonActions.error'),
        locale === 'es' ? 'Error actualizando perfil' : 'Error updating profile'
      );
      // Sentry.captureException('CATCH_UPDATE_PROFILE' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

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
            className='mb-4 text-center '
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
                    editable={!loading}
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
                    editable={!loading}
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
                  editable={!loading}
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
                  editable={!loading}
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
                      editable={!loading}
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
                      editable={!loading}
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
                      editable={!loading}
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
                      editable={!loading}
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
                        editable={!loading}
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
                        editable={!loading}
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
                        editable={!loading}
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
                        editable={!loading}
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
                  disabled={loading}
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
              isLoading={loading}
              disabled={loading}
            >
              {t('screens.editProfile.update')}
            </Button>
          </View>

          {/* Back Button */}
          <View className='mb-4'>
            <Button
              mode='secondary'
              onPress={handleBack}
              disabled={loading}
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
