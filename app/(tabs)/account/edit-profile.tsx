import { View, ScrollView } from 'react-native';
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
import type * as z from 'zod';

export default function EditProfileScreen() {
  const { t, locale } = useTranslation();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);

  // Determinar el rol del usuario (por defecto USER)
  const userRole =
    auth.state === 'authenticated' && auth.role ? auth.role : 'USER';
  const schema =
    userRole === 'AUCTIONEER' ? AuctioneerEditSchema : UserEditSchema;

  // React Hook Form con schema dinámico según el rol
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: 'Alejandro',
      lastName: 'Tejada',
      username: 'tejon17584',
      phoneNumber: '',
      profilePicture: '',
      // Campos adicionales para AUCTIONEER
      ...(userRole === 'AUCTIONEER' && {
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

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    console.log('Form data:', data);

    // TODO: Implementar lógica de actualización con la imagen
    // Si data.profilePicture existe, subirla al servidor
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1500);
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

          {/* Name Input */}
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
                {JSON.parse(errors.name.message || '{}')[locale] ||
                  errors.name.message}
              </CustomText>
            )}
          </View>

          {/* Last Name Input */}
          <View className='mb-4'>
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
                {JSON.parse(errors.lastName.message || '{}')[locale] ||
                  errors.lastName.message}
              </CustomText>
            )}
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
                {JSON.parse(errors.username.message || '{}')[locale] ||
                  errors.username.message}
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
                {JSON.parse(errors.phoneNumber.message || '{}')[locale] ||
                  errors.phoneNumber.message}
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
                  name={'storeName' as any}
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
                {(errors as any).storeName && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {(errors as any).storeName.message}
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
                  name={'webPage' as any}
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
                {(errors as any).webPage && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {(errors as any).webPage.message}
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
                  name={'socialMedia' as any}
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
                {(errors as any).socialMedia && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {(errors as any).socialMedia.message}
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
                  name={'address' as any}
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
                {(errors as any).address && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {(errors as any).address.message}
                  </CustomText>
                )}
              </View>

              {/* Country Input */}
              <View className='mb-4'>
                <CustomText
                  type='body'
                  className='mb-2 '
                >
                  {t('screens.editProfile.country')}*
                </CustomText>
                <Controller
                  control={control}
                  name={'country' as any}
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
                {(errors as any).country && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {(errors as any).country.message}
                  </CustomText>
                )}
              </View>

              {/* Town Input */}
              <View className='mb-4'>
                <CustomText
                  type='body'
                  className='mb-2 '
                >
                  {t('screens.editProfile.town')}*
                </CustomText>
                <Controller
                  control={control}
                  name={'town' as any}
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
                {(errors as any).town && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {(errors as any).town.message}
                  </CustomText>
                )}
              </View>

              {/* Province Input */}
              <View className='mb-4'>
                <CustomText
                  type='body'
                  className='mb-2 '
                >
                  {t('screens.editProfile.province')}*
                </CustomText>
                <Controller
                  control={control}
                  name={'province' as any}
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
                {(errors as any).province && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {(errors as any).province.message}
                  </CustomText>
                )}
              </View>

              {/* Postal Code Input */}
              <View className='mb-4'>
                <CustomText
                  type='body'
                  className='mb-2 '
                >
                  {t('screens.editProfile.postalCode')}*
                </CustomText>
                <Controller
                  control={control}
                  name={'postalCode' as any}
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
                {(errors as any).postalCode && (
                  <CustomText
                    type='error'
                    className='mt-1'
                  >
                    {(errors as any).postalCode.message}
                  </CustomText>
                )}
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
                {JSON.parse(errors.profilePicture.message || '{}')[locale] ||
                  errors.profilePicture.message}
              </CustomText>
            )}
          </View>

          {/* Update Button */}
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
