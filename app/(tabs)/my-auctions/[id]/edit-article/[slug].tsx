import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { useLocalSearchParams, router } from 'expo-router';

import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/utils/form-errors';
import { useToast } from '@/hooks/useToast';
import { useArticleForm } from '@/hooks/components/useArticleForm';
import {
  ArticleCategories,
  AuctionCategories,
  AuctionCategoriesConst,
  FromArticleCategoryToAuctionCategory,
} from '@/types/types';
import {
  ARTICLE_IMAGES_MAX,
  ARTICLE_STATE,
  ARTICLE_STATE_DESCRIPTION,
  ARTICLE_STATE_LABELS,
  REQUEST_STATUS,
} from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { AUCTION_CATEGORIES_LABEL } from '@/constants/auctions';
import { supabase } from '@/utils/supabase/supabase-store';
import { useArticleImages } from '@/hooks/components/useArticleImages';
import { ARTICLE_IMAGES_MIN } from '@/constants/files';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { ArticleExtraFields } from '@/components/articles/ArticleExtraFields';
import { Tooltip } from '@/components/ui/Tooltip';
import { SelectField } from '@/components/fields/SelectField';
import { useArticle } from '@/hooks/pages/my-auction/useArticle';
import { mapArticleToFormValues } from '@/utils/mapArticleToFormValues';
import { useGetArticle } from '@/hooks/pages/article/useGetArticle';
import { useGetArticleComments } from '@/hooks/pages/my-auction/useGetArticleComments';
import { ArticleComments } from '@/components/articles/ArticleComments';

export default function EditAuctionArticleScreen() {
  const params = useLocalSearchParams<{
    id: string;
    slug: string;
  }>();

  const auctionId = params.id;
  const articleId = params.slug;

  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const hasHydratedForm = useRef(false);

  const {
    data: article,
    status,
    errorMessage,
  } = useGetArticle({
    articleId,
  });

  const { editArticle } = useArticle({
    auctionId,
  });
  const { data: comments } = useGetArticleComments({
    auctionId,
    articleId,
  });

  const {
    images,
    removedImages,
    isUploading: isUploadingImages,
    handleImagesSelected,
    handleRemoveImageAt,
    validateMinImages,
    uploadAllAndGetPublicUrls,
    resetRemovedRemoteImages,
  } = useArticleImages({
    supabase,
    bucket: 'develop',
    folder: 'images',
    minImages: ARTICLE_IMAGES_MIN,
    callToast,
  });

  const auctionCategory =
    (article?.category &&
      FromArticleCategoryToAuctionCategory[
        article.category as ArticleCategories
      ]) ||
    AuctionCategoriesConst.WATCHES;

  const form = useArticleForm({
    category: auctionCategory,
    mode: 'edit',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!article) return;
    if (hasHydratedForm.current) return;

    const initialValues = mapArticleToFormValues(auctionCategory, article);
    reset(initialValues);

    if (Array.isArray(article.images) && article.images.length > 0) {
      handleImagesSelected(article.images);
    }

    resetRemovedRemoteImages();
    hasHydratedForm.current = true;
  }, [
    article,
    auctionCategory,
    reset,
    handleImagesSelected,
    resetRemovedRemoteImages,
  ]);

  useEffect(() => {
    hasHydratedForm.current = false;
  }, [articleId]);

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !article) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute={`/(tabs)/my-auctions/${auctionId}/edit-article/${articleId}`}
      />
    );
  }

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
    setIsSavingArticle(true);

    if (!validateMinImages()) {
      callToast({
        variant: 'error',
        description: {
          es: `Debe haber al menos ${ARTICLE_IMAGES_MIN} imágenes.`,
          en: `There must be at least ${ARTICLE_IMAGES_MIN} images.`,
        },
      });

      setIsSavingArticle(false);
      return;
    }

    const publicUrls = await uploadAllAndGetPublicUrls();

    const response = await editArticle({
      articleId: Number(articleId),
      images: publicUrls,
      removedImages: removedImages,
      articleAuctionId: article.auctionId?.toString() as string,
      values: { ...data },
    });

    if (response.status === 'error') {
      setIsSavingArticle(false);
      return;
    }

    setIsSavingArticle(false);
    router.navigate(`/(tabs)/my-auctions/${auctionId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  const isLoading = isSubmitting || isUploadingImages || isSavingArticle;

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView className='flex-1'>
        <View className='p-6'>
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

          <ArticleComments comments={comments || []} />

          <CustomText
            type='body'
            className='mb-2 text-red-600'
          >
            {t('screens.newArticle.required')}
          </CustomText>

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
              render={({ field: { onChange, value } }) => (
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
                {getErrorMessage(errors.state.message, locale)}
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

          {/* Extra fields por categoría (reusando el mismo componente) */}
          <ArticleExtraFields
            control={control}
            errors={errors}
            isLoading={isLoading}
            category={auctionCategory}
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

          {/* Images */}
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
