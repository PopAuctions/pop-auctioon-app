import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { router } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useToast } from '@/hooks/useToast';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { SelectField } from '@/components/fields/SelectField';
import { getErrorMessage } from '@/utils/form-errors';
import { Tooltip } from '@/components/ui/Tooltip';
import { AuctionCategories, AuctionCategoriesConst } from '@/types/types';
import { AUCTION_CATEGORIES_LABEL } from '@/constants/auctions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/utils/supabase/supabase-store';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { useAuction } from '@/hooks/pages/my-auction/useAuction';
import { useAuctionForm } from '@/hooks/components/useAuctionForm';
import { DateInputField } from '@/components/fields/DateInputField';
import { TimeInputField } from '@/components/fields/TimeInputField';
import { getMinDateToStartAuction } from '@/utils/getMinDateToStartAuction';
import { useArticleImages } from '@/hooks/components/useArticleImages';
import { useFetchAvailableCountries } from '@/hooks/globals/useFetchAvailableCountries';
import { REQUEST_STATUS } from '@/constants';

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

  const { createAuction } = useAuction();

  const {
    images,
    isUploading: isUploadingImages,
    handleSingleImageSelected,
    handleRemoveImageAt,
    validateMinImages,
    uploadAllAndGetPublicUrls,
  } = useArticleImages({
    supabase,
    bucket: 'develop',
    folder: 'images',
    minImages: 1,
    callToast,
  });

  const { data: countries, status: countriesStatus } =
    useFetchAvailableCountries();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useAuctionForm({ mode: 'create' });

  const { minDate, minDateFormatted } = useMemo(
    () => getMinDateToStartAuction(),
    []
  );

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

  const onSubmit = async (data: any) => {
    try {
      setIsUploadingAuction(true);

      if (!validateMinImages()) {
        setIsUploadingAuction(false);
        return;
      }

      const publicUrls = await uploadAllAndGetPublicUrls();
      const imageUrl = publicUrls[0];

      if (!imageUrl) {
        callToast({
          variant: 'error',
          description: {
            en: 'There was an error uploading the image.',
            es: 'Hubo un error subiendo la imagen.',
          },
        });
        setIsUploadingAuction(false);
        return;
      }

      const response = await createAuction({
        values: { ...data },
        imageFile: imageUrl,
      });

      if (response.status === 'error') {
        setIsUploadingAuction(false);
        return;
      }

      router.navigate('/(tabs)/auctioneer/my-auctions');
    } catch {
      callToast({
        variant: 'error',
        description: {
          en: 'There was an error creating the auction.',
          es: 'Hubo un error al crear la subasta.',
        },
      });
    } finally {
      setIsUploadingAuction(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isLoading =
    isSubmitting ||
    isUploadingImages ||
    isUploadingAuction ||
    countriesStatus === REQUEST_STATUS.loading;

  if (isLoading) {
    return <Loading locale={locale} />;
  }

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={[]}
    >
      <ScrollView className='flex-1'>
        <View className='p-6 md:px-0'>
          <View className='w-full md:max-w-[700px] md:self-center'>
            <View className='mb-4'>
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
                    options={countries?.[locale] ?? []}
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
                      ([, category]) => ({
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
              <DateInputField
                control={control}
                name='startDate'
                placeholder={minDateFormatted}
                disabled={isLoading}
                minimumDate={minDate}
                title={t('screens.myAuction.newAuction.startDate')}
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
              <TimeInputField
                control={control}
                name='startTime'
                placeholder='18:00'
                disabled={isLoading}
                title={t('screens.myAuction.newAuction.startTime')}
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
                {t('screens.myAuction.newAuction.image')}*
              </CustomText>

              <ImageUploadButton
                selectedImage={images[0] ?? null}
                onImageSelected={handleSingleImageSelected}
                onImageRemoved={() => handleRemoveImageAt(0)}
                disabled={isLoading}
              />

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
