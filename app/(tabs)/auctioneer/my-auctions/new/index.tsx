import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useToast } from '@/hooks/useToast';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { SelectField } from '@/components/fields/SelectField';
import { getErrorMessage } from '@/utils/form-errors';
import { AVAILABLE_COUNTRIES_LANG } from '@/constants';
import { Tooltip } from '@/components/ui/Tooltip';
import { AuctionCategories, AuctionCategoriesConst } from '@/types/types';
import { AUCTION_CATEGORIES_LABEL } from '@/constants/auctions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuction } from '@/hooks/pages/my-auction/useAuction';
import { useAuctionForm } from '@/hooks/components/useAuctionForm';

type PickedFile = {
  uri: string;
  name: string;
  mimeType?: string;
};

const TOOLTIP_MESSAGE = {
  en: {
    main: 'Choose the category that best matches the auction.',
    strong: 'This cannot be changed later.',
  },
  es: {
    main: 'Elige la categoría que mejor corresponda a la subasta.',
    strong: 'Esto no podrá cambiarse después.',
  },
};

export default function MyANewAuctionScreen() {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);

  const [isUploadingAuction, setIsUploadingAuction] = useState(false);
  const [imageFile, setImageFile] = useState<PickedFile | null>(null);

  const { createAuction } = useAuction();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useAuctionForm({ mode: 'create' });

  const minDate = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const tooltipContent = (
    <View className='gap-2'>
      <CustomText
        type='body'
        className='text-sm text-black/70'
      >
        {TOOLTIP_MESSAGE[locale].main}
      </CustomText>
      <CustomText
        type='body'
        className='text-sm text-black/70'
      >
        {TOOLTIP_MESSAGE[locale].strong}
      </CustomText>
    </View>
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      callToast({
        variant: 'error',
        description: {
          en: 'Photo library permission is required.',
          es: 'Se requiere permiso para acceder a la galería.',
        },
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    setImageFile({
      uri: asset.uri,
      name: asset.fileName ?? `auction-image-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  };

  const removeImage = () => setImageFile(null);

  const onSubmit = async (data: any) => {
    try {
      setIsUploadingAuction(true);

      if (imageFile === null) {
        callToast({
          variant: 'error',
          description: {
            en: 'Image is required.',
            es: 'La imagen es requerida.',
          },
        });
        setIsUploadingAuction(false);
        return;
      }

      const response = await createAuction({
        values: {
          ...data,
        },
        imageFile: imageFile.uri,
      });

      if (response.status === 'error') {
        setIsUploadingAuction(false);
        return;
      }

      setIsUploadingAuction(false);
      router.navigate('/(tabs)/auctioneer/my-auctions');
    } catch {
      setIsUploadingAuction(false);
      callToast({
        variant: 'error',
        description: {
          en: 'There was an error creating the auction.',
          es: 'Hubo un error al crear la subasta.',
        },
      });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isLoading = isSubmitting || isUploadingAuction;

  if (isLoading) {
    return <Loading locale={locale} />;
  }

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView className='flex-1'>
        <View className='p-6 md:px-0'>
          <View className='w-full md:max-w-[700px] md:self-center'>
            <View className='mb-4'>
              <CustomText
                type='subtitle'
                className='mb-4 text-center text-3xl text-cinnabar'
              >
                {t('screens.myAuction.newAuction.titlePage')}
              </CustomText>

              <CustomText
                type='body'
                className='text-red-600'
              >
                {t('screens.myAuction.newAuction.required')}
              </CustomText>
            </View>

            {/* Title */}
            <View className='mb-4'>
              <CustomText
                type='body'
                className='mb-2'
              >
                {t('screens.myAuction.newAuction.title')}*
              </CustomText>
              <Controller
                control={control}
                name='title'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('screens.myAuction.newAuction.title')}
                    editable={!isLoading}
                  />
                )}
              />
              {errors.title && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.title.message, locale)}
                </CustomText>
              )}
            </View>

            {/* Country */}
            <View className='mb-4'>
              <CustomText
                type='body'
                className='mb-2'
              >
                {t('screens.myAuction.newAuction.country')}*
              </CustomText>
              <Controller
                control={control}
                name='country'
                render={({ field: { onChange, value } }) => (
                  <SelectField
                    name='country'
                    value={value ?? null}
                    options={AVAILABLE_COUNTRIES_LANG[locale]}
                    placeholder={t('screens.myAuction.newAuction.country')}
                    isSearchable={true}
                    isDisabled={isLoading}
                    formField={true}
                    isClearable={true}
                    onChange={onChange}
                  />
                )}
              />
              {errors.country && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.country.message, locale)}
                </CustomText>
              )}
            </View>

            {/* Category */}
            <View className='mb-4'>
              <View className='flex flex-row gap-2'>
                <Tooltip content={tooltipContent} />
                <CustomText
                  type='body'
                  className='mb-2'
                >
                  {t('screens.myAuction.newAuction.category')}*
                </CustomText>
              </View>

              <Controller
                control={control}
                name='category'
                render={({ field: { onChange, value } }) => (
                  <SelectField
                    name='category'
                    value={value ?? null}
                    options={Object.entries(AuctionCategoriesConst).map(
                      ([key, category]) => ({
                        label:
                          AUCTION_CATEGORIES_LABEL[locale][
                            category as AuctionCategories
                          ],
                        value: category,
                      })
                    )}
                    placeholder={t('screens.myAuction.newAuction.category')}
                    isSearchable={false}
                    isDisabled={isLoading}
                    formField={true}
                    isClearable={true}
                    onChange={onChange}
                  />
                )}
              />
              {errors.category && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.category.message, locale)}
                </CustomText>
              )}
            </View>

            {/* Start Date */}
            <View className='mb-4'>
              <CustomText
                type='body'
                className='mb-2'
              >
                {t('screens.myAuction.newAuction.startDate')}*
              </CustomText>
              <Controller
                control={control}
                name='startDate'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={minDate}
                    editable={!isLoading}
                  />
                )}
              />
              {errors.startDate && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.startDate.message, locale)}
                </CustomText>
              )}
            </View>

            {/* Start Time */}
            <View className='mb-4'>
              <CustomText
                type='body'
                className='mb-2'
              >
                {t('screens.myAuction.newAuction.startTime')}*
              </CustomText>
              <Controller
                control={control}
                name='startTime'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder='18:00'
                    editable={!isLoading}
                  />
                )}
              />
              {errors.startTime && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.startTime.message, locale)}
                </CustomText>
              )}
            </View>

            {/* Image */}
            <View className='mb-6'>
              <CustomText
                type='body'
                className='mb-2'
              >
                {t('screens.myAuction.newAuction.image')}
              </CustomText>

              <Button
                mode='secondary'
                onPress={pickImage}
                disabled={isLoading}
              >
                {t('screens.myAuction.newAuction.image')}
              </Button>

              <CustomText
                type='body'
                className='mt-2 text-sm text-black/60'
              >
                {t('screens.myAuction.newAuction.imageFormats')}
              </CustomText>

              {imageFile?.uri ? (
                <View className='mt-4 items-start gap-3'>
                  <Image
                    source={{ uri: imageFile.uri }}
                    className='h-[220px] w-full rounded-lg'
                    resizeMode='contain'
                  />

                  <Pressable onPress={removeImage}>
                    <CustomText
                      type='body'
                      className='text-cinnabar'
                    >
                      {t('screens.myAuction.newAuction.removeImage')}
                    </CustomText>
                  </Pressable>
                </View>
              ) : null}

              {errors.image && (
                <CustomText
                  type='error'
                  className='mt-1'
                >
                  {getErrorMessage(errors.image.message, locale)}
                </CustomText>
              )}
            </View>

            {/* Submit Button */}
            <View className='mb-4'>
              <Button
                mode='primary'
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
                disabled={isLoading}
              >
                {t('screens.myAuction.newAuction.submit')}
              </Button>
            </View>

            {/* Cancel Button */}
            <View className='mb-4'>
              <Button
                mode='secondary'
                onPress={handleCancel}
                disabled={isLoading}
              >
                {t('screens.myAuction.newAuction.cancel')}
              </Button>
            </View>

            <View className='h-8' />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
