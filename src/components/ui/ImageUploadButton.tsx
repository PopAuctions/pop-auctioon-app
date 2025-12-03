import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { FontAwesome } from '@expo/vector-icons';
import { ARTICLE_IMAGES_MAX } from '@/constants';
import { compressImage } from '@/utils/compress-image';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { FontAwesomeIcon } from './FontAwesomeIcon';

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
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const [isCompressing, setIsCompressing] = useState(false);

  // Determinar si ya alcanzó el límite de imágenes
  const hasReachedLimit = multiple
    ? selectedImages.length >= maxImages
    : !!selectedImage;

  const handleAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setIsCompressing(true);

    try {
      if (multiple) {
        const compressionPromises = assets.map(async (asset) => {
          const compressedUri = await compressImage(asset.uri);
          return compressedUri || asset.uri;
        });

        const compressedUris = await Promise.all(compressionPromises);
        const allImages = [...selectedImages, ...compressedUris].slice(
          0,
          maxImages
        );
        onImagesSelected?.(allImages);
      } else {
        const originalUri = assets[0].uri;
        const compressedUri = await compressImage(originalUri);

        if (!compressedUri) {
          callToast({
            variant: 'error',
            description: 'screens.editProfile.compressionError',
          });
          return;
        }

        onImageSelected?.(compressedUri);
      }
    } catch {
      callToast({
        variant: 'error',
        description: 'screens.editProfile.compressionError',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      callToast({
        variant: 'error',
        description: 'screens.editProfile.permissionRequired',
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await handleAssets(result.assets);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      callToast({
        variant: 'error',
        description: 'screens.editProfile.permissionRequired',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: multiple,
      selectionLimit: multiple ? maxImages - selectedImages.length : 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await handleAssets(result.assets);
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
          <View className='flex-row justify-center gap-4 py-2'>
            {/* Gallery button */}
            <TouchableOpacity
              onPress={pickImage}
              disabled={disabled || isCompressing}
              className='items-center'
              activeOpacity={0.7}
            >
              {isCompressing ? (
                <>
                  <ActivityIndicator
                    size='large'
                    color='#e63946'
                    style={{ marginBottom: 6 }}
                  />
                  <CustomText
                    type='body'
                    className='text-gray-600 mb-1 text-center'
                  >
                    {t('screens.editProfile.compressingImages')}
                  </CustomText>
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    variant='bold'
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
                </>
              )}
            </TouchableOpacity>

            {/* Camera button */}
            {!isCompressing && (
              <TouchableOpacity
                onPress={takePhoto}
                disabled={disabled}
                className='items-center'
                activeOpacity={0.7}
              >
                <FontAwesomeIcon
                  variant='bold'
                  name='camera'
                  size={32}
                  color='#9ca3af'
                  style={{ marginBottom: 6 }}
                />
                <CustomText
                  type='body'
                  className='text-gray-600 mb-1 text-center'
                >
                  {t('screens.editProfile.takePhoto')}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Si alcanzó el límite */}
        {hasReachedLimit && (
          <View className='items-center py-2'>
            <FontAwesomeIcon
              variant='bold'
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
