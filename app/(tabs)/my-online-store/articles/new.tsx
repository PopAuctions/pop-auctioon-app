import { useMemo, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { useLocalSearchParams, router } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { ArticleExtraFields } from '@/components/articles/ArticleExtraFields';
import { Tooltip } from '@/components/ui/Tooltip';
import { SelectField } from '@/components/fields/SelectField';
import { useOnlineStoreArticle } from '@/hooks/pages/online-store/useOnlineStoreArticle';
import { useArticleImages } from '@/hooks/components/useArticleImages';
import { useToast } from '@/hooks/useToast';
import { useArticleForm } from '@/hooks/components/useArticleForm';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { getErrorMessage } from '@/utils/form-errors';
import { supabase } from '@/utils/supabase/supabase-store';
import { AUCTION_CATEGORIES_LABEL } from '@/constants/auctions';
import { ARTICLE_IMAGES_MIN } from '@/constants/files';
import {
  AMOUNT_PLACEHOLDER,
  ARTICLE_IMAGES_MAX,
  ARTICLE_STATE,
  ARTICLE_STATE_DESCRIPTION,
  ARTICLE_STATE_LABELS,
  REQUEST_STATUS,
} from '@/constants';
import { AuctionCategories, AuctionCategoriesConst } from '@/types/types';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { euroFormatter } from '@/utils/euroFormatter';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';

export default function NewOnlineStoreArticleScreen() {
  const params = useLocalSearchParams<{
    category?: AuctionCategories;
  }>();
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const [isUploadingArticle, setIsUploadingArticle] = useState(false);

  const category = params.category;

  const { createArticle } = useOnlineStoreArticle();

  const {
    images,
    isUploading: isUploadingImages,
    handleImagesSelected,
    handleRemoveImageAt,
    validateMinImages,
    uploadAllAndGetPublicUrls,
  } = useArticleImages({
    supabase,
    bucket: 'develop',
    folder: 'images',
    minImages: ARTICLE_IMAGES_MIN,
    callToast: callToast,
  });

  const {
    data: commissionValue = 0,
    status,
    errorMessage,
  } = useFetchCommissions();

  const auctionCategory = category
    ? AuctionCategoriesConst[category]
    : AuctionCategoriesConst.BAGS;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useArticleForm({
    category: auctionCategory,
    mode: 'create',
  });

  const startingPrice = watch('startingPrice');
  const commissionedPrice = useMemo(() => {
    if (!startingPrice) return null;
    return getArticleCommissionedPrice(Number(startingPrice), commissionValue);
  }, [startingPrice, commissionValue]);

  if (status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/my-online-store/articles/new'
      />
    );
  }

  const formatter = euroFormatter(locale, 2);

  const tooltipContent = (
    <View className='gap-2'>
      {Object.entries(ARTICLE_STATE_DESCRIPTION[locale]).map(([key, value]) => {
        const label =
          ARTICLE_STATE_LABELS[locale][
            key as keyof (typeof ARTICLE_STATE_LABELS)['en']
          ];

        return (
          <CustomText
            key={key}
            type='body'
            className='text-sm text-black/70'
          >
            <Text className='font-bold text-black'>{label}</Text>
            {`: ${value}`}
          </CustomText>
        );
      })}
    </View>
  );

  const onSubmit = async (data: any) => {
    setIsUploadingArticle(true);
    if (!validateMinImages()) {
      callToast({
        variant: 'error',
        description: {
          es: `Debe subir al menos ${ARTICLE_IMAGES_MIN} imágenes.`,
          en: `You must upload at least ${ARTICLE_IMAGES_MIN} images.`,
        },
      });
      setIsUploadingArticle(false);
      return;
    }

    const publicUrls = await uploadAllAndGetPublicUrls();

    const response = await createArticle({
      values: { ...data },
      images: publicUrls,
    });

    if (response.status === 'error') {
      setIsUploadingArticle(false);
      return;
    }

    setIsUploadingArticle(false);
    router.navigate(`/(tabs)/my-online-store`);
  };

  const handleCancel = () => {
    router.back();
  };

  const isLoading = isSubmitting || isUploadingImages || isUploadingArticle;

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView className='flex-1'>
        <View className='p-6'>
          <View className='mb-4'>
            <CustomText
              type='subtitle'
              className='mb-4 text-center text-3xl text-cinnabar'
            >
              {
                AUCTION_CATEGORIES_LABEL[locale][
                  auctionCategory as AuctionCategories
                ]
              }
            </CustomText>

            {/* Info: category / required fields */}
            <CustomText
              type='body'
              className='text-red-600'
            >
              {t('screens.newArticle.required')}
            </CustomText>
          </View>

          {/* Title */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.title')}*
            </CustomText>
            <Controller
              control={control}
              name='title'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.title')}
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

          {/* STATE */}
          <View className='mb-4'>
            <View className='flex flex-row gap-2'>
              <Tooltip content={tooltipContent} />
              <CustomText
                type='body'
                className='mb-2'
              >
                {t('screens.newArticle.state')}*
              </CustomText>
            </View>
            <Controller
              control={control}
              name='state'
              render={({ field: { onChange, onBlur, value } }) => (
                <SelectField
                  name='state'
                  value={value ?? null}
                  options={ARTICLE_STATE[locale]}
                  placeholder={t('screens.newArticle.state')}
                  isSearchable={true}
                  isDisabled={isLoading}
                  formField={true}
                  isClearable={true}
                  onChange={onChange}
                />
              )}
            />
            {errors.state && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.state?.message, locale)}
              </CustomText>
            )}
          </View>

          {/* Starting Price */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.startingPrice')}*
            </CustomText>
            <Controller
              control={control}
              name='startingPrice'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={String(value ?? '')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.startingPrice')}
                  keyboardType='number-pad'
                  editable={!isLoading}
                />
              )}
            />
            {errors.startingPrice && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.startingPrice.message, locale)}
              </CustomText>
            )}
          </View>
          <View className='mb-4 flex flex-row gap-2'>
            <Tooltip
              content={t('screens.newArticle.commissionedPriceTooltip')}
            />
            <CustomText
              type='body'
              className='text-black/70'
            >
              {t('screens.newArticle.commissionedPrice')}:{' '}
              <Text className='font-bold text-black'>
                {commissionedPrice !== null
                  ? formatter.format(commissionedPrice)
                  : AMOUNT_PLACEHOLDER}
              </Text>
            </CustomText>
          </View>

          {/* Estimated Value */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.estimatedValue')}
            </CustomText>
            <Controller
              control={control}
              name='estimatedValue'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={
                    value === null || value === undefined ? '' : String(value)
                  }
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.estimatedValue')}
                  keyboardType='number-pad'
                  editable={!isLoading}
                />
              )}
            />
            {errors.estimatedValue && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.estimatedValue.message, locale)}
              </CustomText>
            )}
          </View>

          <ArticleExtraFields
            control={control}
            errors={errors}
            isLoading={isLoading}
            auctionCategory={auctionCategory}
            auctionView={false}
          />

          {/* Description */}
          <View className='mb-6'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.description')}*
            </CustomText>
            <Controller
              control={control}
              name='description'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.description')}
                  editable={!isLoading}
                  multiline
                  numberOfLines={4}
                  textAlignVertical='top'
                  className='h-28'
                />
              )}
            />
            {errors.description && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.description.message, locale)}
              </CustomText>
            )}
          </View>

          <View className='mb-6'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.images')}
            </CustomText>

            <ImageUploadButton
              multiple
              selectedImages={images}
              onImagesSelected={handleImagesSelected}
              onImageRemovedAt={handleRemoveImageAt}
              maxImages={ARTICLE_IMAGES_MAX}
              disabled={isLoading}
            />
          </View>

          {/* Submit Button */}
          <View className='mb-4'>
            <Button
              mode='primary'
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('screens.newArticle.submit')}
            </Button>
          </View>

          {/* Cancel Button */}
          <View className='mb-4'>
            <Button
              mode='secondary'
              onPress={handleCancel}
              disabled={isLoading}
            >
              {t('screens.newArticle.cancel')}
            </Button>
          </View>

          <View className='h-8' />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
