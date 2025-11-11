import { View, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { FontAwesome } from '@expo/vector-icons';
import { ARTICLE_IMAGES_MAX } from '@/constants';

interface ImageUploadButtonProps {
  // Para modo simple (una sola imagen)
  selectedImage?: string | null;
  onImageSelected?: (uri: string) => void;
  onImageRemoved?: () => void;

  // Para modo múltiple
  selectedImages?: string[];
  onImagesSelected?: (uris: string[]) => void;
  onImageRemovedAt?: (index: number) => void;

  // Configuración
  multiple?: boolean;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUploadButton({
  // Modo simple
  selectedImage,
  onImageSelected,
  onImageRemoved,
  // Modo múltiple
  selectedImages = [],
  onImagesSelected,
  onImageRemovedAt,
  // Configuración
  multiple = false,
  maxImages = ARTICLE_IMAGES_MAX,
  disabled = false,
}: ImageUploadButtonProps) {
  const { t } = useTranslation();

  // Determinar si ya alcanzó el límite de imágenes
  const hasReachedLimit = multiple
    ? selectedImages.length >= maxImages
    : !!selectedImage;

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
      quality: 0.8,
      allowsMultipleSelection: multiple,
      selectionLimit: multiple ? maxImages - selectedImages.length : 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (multiple) {
        // Modo múltiple: agregar todas las imágenes seleccionadas
        const newImageUris = result.assets.map((asset) => asset.uri);
        const allImages = [...selectedImages, ...newImageUris].slice(
          0,
          maxImages
        );
        onImagesSelected?.(allImages);

        // Verificar si alguna imagen es muy grande
        const largeImages = result.assets.filter(
          (asset) => asset.fileSize && asset.fileSize > 1024 * 1024
        );
        if (largeImages.length > 0) {
          Alert.alert(
            t('screens.editProfile.imageTooLarge'),
            t('screens.editProfile.imageTooLargeMessage'),
            [{ text: t('commonActions.ok') }]
          );
        }
      } else {
        // Modo simple: una sola imagen
        const imageUri = result.assets[0].uri;
        onImageSelected?.(imageUri);

        // Verificar tamaño del archivo
        const fileSize = result.assets[0].fileSize;
        if (fileSize && fileSize > 1024 * 1024) {
          Alert.alert(
            t('screens.editProfile.imageTooLarge'),
            t('screens.editProfile.imageTooLargeMessage'),
            [{ text: t('commonActions.ok') }]
          );
        }
      }
    }
  };

  const handleRemoveImage = () => {
    onImageRemoved?.();
  };

  const handleRemoveImageAt = (index: number) => {
    onImageRemovedAt?.(index);
  };

  return (
    <View>
      {/* Contenedor principal con borde */}
      <View className='border-gray-300 bg-gray-50 min-h-[120px] rounded-lg border-2 border-dashed p-4'>
        {/* Preview de imágenes */}
        {multiple
          ? selectedImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className='mb-3'
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <View className='flex-row gap-3'>
                  {selectedImages.map((imageUri, index) => (
                    <View
                      key={`${imageUri}-${index}`}
                      className='relative'
                    >
                      <Image
                        source={{ uri: imageUri }}
                        className='h-20 w-20 rounded-lg'
                        resizeMode='cover'
                        testID='image'
                      />
                      {/* Botón para eliminar */}
                      <TouchableOpacity
                        onPress={() => handleRemoveImageAt(index)}
                        className='absolute -right-0.5 -top-0.5 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-lg'
                        disabled={disabled}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <FontAwesome
                          name='times'
                          size={13}
                          color='white'
                        />
                      </TouchableOpacity>
                      {/* Número de imagen */}
                      <View className='absolute bottom-1 left-1 rounded-full bg-black/70 px-1.5 py-0.5'>
                        <CustomText
                          type='bodysmall'
                          className='text-[10px] font-bold text-white'
                        >
                          {index + 1}
                        </CustomText>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )
          : selectedImage && (
              <View className='mb-3 items-center'>
                <View className='relative'>
                  <Image
                    source={{ uri: selectedImage }}
                    className='h-24 w-24 rounded-lg'
                    resizeMode='cover'
                    testID='image'
                  />
                  {/* Botón para eliminar */}
                  <TouchableOpacity
                    onPress={handleRemoveImage}
                    className='absolute -right-0.5 -top-0.5 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-lg'
                    disabled={disabled}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <FontAwesome
                      name='times'
                      size={14}
                      color='white'
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

        {/* Botón de subida / mensaje */}
        {!hasReachedLimit && (
          <TouchableOpacity
            onPress={pickImage}
            disabled={disabled}
            className='items-center py-2'
            activeOpacity={0.7}
          >
            <FontAwesome
              name='cloud-upload'
              size={32}
              color='#9ca3af'
              style={{ marginBottom: 6 }}
            />
            <CustomText
              type='body'
              className='text-gray-600 mb-1 text-center'
            >
              {multiple
                ? selectedImages.length > 0
                  ? t('screens.editProfile.addMoreImages')
                  : t('screens.editProfile.uploadImageButton')
                : selectedImage
                  ? t('screens.editProfile.changeImageText')
                  : t('screens.editProfile.uploadImageButton')}
            </CustomText>
            {multiple && (
              <CustomText
                type='bodysmall'
                className='text-gray-400 text-xs'
              >
                {selectedImages.length} / {maxImages}
              </CustomText>
            )}
          </TouchableOpacity>
        )}

        {/* Si alcanzó el límite */}
        {hasReachedLimit && (
          <View className='items-center py-2'>
            <FontAwesome
              name='check-circle'
              size={32}
              color='#10b981'
              style={{ marginBottom: 6 }}
            />
            <CustomText
              type='body'
              className='mb-1 text-center text-green-600'
            >
              {multiple
                ? `${selectedImages.length} ${t('screens.editProfile.imagesSelected')}`
                : t('screens.editProfile.imageSelected')}
            </CustomText>
          </View>
        )}
      </View>

      {/* Información de formatos soportados */}
      <CustomText
        type='subtitle'
        className='text-gray-400 mt-2 text-center text-sm'
      >
        {t('screens.editProfile.supportedFormats')}
      </CustomText>
    </View>
  );
}
