import { View, TouchableOpacity, Image, Alert } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface ImageUploadButtonProps {
  selectedImage: string | null;
  onImageSelected: (uri: string) => void;
  disabled?: boolean;
}

export function ImageUploadButton({
  selectedImage,
  onImageSelected,
  disabled = false,
}: ImageUploadButtonProps) {
  const { t } = useTranslation();

  const pickImage = async () => {
    // Solicitar permisos para acceder a la galería
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        t('screens.editProfile.permissionRequired'),
        t('screens.editProfile.permissionMessage'),
        [{ text: t('commonActions.ok') }]
      );
      return;
    }

    // Abrir el selector de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8, // Calidad de compresión
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      onImageSelected(imageUri);

      // Verificar tamaño del archivo (opcional)
      const fileSize = result.assets[0].fileSize;
      if (fileSize && fileSize > 1024 * 1024) {
        // Más de 1MB
        Alert.alert(
          t('screens.editProfile.imageTooLarge'),
          t('screens.editProfile.imageTooLargeMessage'),
          [{ text: t('commonActions.ok') }]
        );
      }
    }
  };

  return (
    <View>
      <TouchableOpacity
        className='border-gray-300 bg-gray-50 items-center justify-center rounded-lg border-2 border-dashed py-8'
        onPress={pickImage}
        disabled={disabled}
      >
        {selectedImage ? (
          <View className='items-center'>
            <Image
              source={{ uri: selectedImage }}
              className='mb-3 h-32 w-32 rounded-lg'
              resizeMode='cover'
            />
            <CustomText
              type='body'
              className='text-cinnabar'
            >
              {t('screens.editProfile.changeImageText')}
            </CustomText>
          </View>
        ) : (
          <CustomText
            type='body'
            className='text-gray-600 mb-2'
          >
            {t('screens.editProfile.uploadImageButton')}
          </CustomText>
        )}
      </TouchableOpacity>

      <CustomText
        type='subtitle'
        className='text-gray-400 mt-2 text-center text-sm'
      >
        {t('screens.editProfile.supportedFormats')}
      </CustomText>
    </View>
  );
}
