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
import { EditProfileSchema, type EditProfileSchemaType } from '@/utils/schemas';

export default function EditProfileScreen() {
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);

  // React Hook Form con validación Zod
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileSchemaType>({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      name: 'Alejandro',
      lastName: 'Tejada',
      username: 'tejon17584',
      phoneNumber: '',
      profilePicture: '',
    },
  });

  const onSubmit = async (data: EditProfileSchemaType) => {
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
