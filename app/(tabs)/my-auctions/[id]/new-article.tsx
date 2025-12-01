import { View, ScrollView } from 'react-native';
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
import { AuctionCategories, AuctionCategoriesConst } from '@/types/types';
import { useGetLiveAuction } from '@/hooks/pages/auction/useGetLiveAuction';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { AUCTION_CATEGORIES_LABEL } from '@/constants/auctions';
// import { useCreateArticle } from '@/hooks/pages/article/useCreateArticle';

export default function NewAuctionArticleScreen() {
  const params = useLocalSearchParams<{
    id: string;
  }>();
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);

  const auctionId = params.id;
  const {
    data: liveAuction,
    status,
    errorMessage,
  } = useGetLiveAuction({
    auctionId,
  });

  const auctionCategory = liveAuction?.Auction.category
    ? AuctionCategoriesConst[liveAuction.Auction.category]
    : AuctionCategoriesConst.BAGS;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useArticleForm({
    category: auctionCategory,
    mode: 'create',
  });

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !liveAuction) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute={`/(tabs)/my-auctions/${auctionId}/new-article`}
      />
    );
  }

  // const { createArticle, status, errorMessage } = useCreateArticle();

  const onSubmit = async (data: any) => {
    // TODO: integrate with your real createArticle hook / securePost
    // const result = await createArticle({ ...data, auctionId });

    // For now, just fake success:
    console.log('New article form submit', {
      auctionId,
      auctionCategory,
      data,
    });

    callToast({
      variant: 'success',
      description: 'screens.newArticle.createSuccess',
    });

    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const isLoading = isSubmitting; // later you can OR with mutation status

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
            {'title' in errors && errors.title && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.title.message, locale)}
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
            {'startingPrice' in errors && errors.startingPrice && (
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
            {'estimatedValue' in errors && errors.estimatedValue && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.estimatedValue.message, locale)}
              </CustomText>
            )}
          </View>

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
            {'description' in errors && errors.description && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(errors.description.message, locale)}
              </CustomText>
            )}
          </View>

          {/* TODO: later - add images, category-specific fields, etc. */}

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
