import { AuctionStatus } from '@/constants/auctions';
import { View } from '../Themed';
import { CustomLink } from '../ui/CustomLink';
import { CustomText } from '../ui/CustomText';
import { MyAuctionArticles } from './MyAuctionArticles';
import { MyAuctionArticlesFilters } from './MyAuctionArticlesFilters';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { useLocalSearchParams } from 'expo-router';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { LangMap } from '@/types/types';
import { SECURE_ENDPOINTS } from '@/config/api-config';

export const MyAuctionArticlesSection = ({
  auctionId,
  auctionStatus,
  articlesOrder,
  ListHeaderComponent,
}: {
  auctionId: string;
  auctionStatus: AuctionStatus;
  articlesOrder?: number[];
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}) => {
  const [isOrderingItems, setIsOrderingItems] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderedIds, setOrderedIds] = useState<number[] | null>(null);

  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { securePost } = useSecureApi();
  const searchParams = useLocalSearchParams();

  const auctionLang = t('screens.myAuction');
  const effectiveOrder = orderedIds ?? articlesOrder ?? [];

  const toggleOrderingItems = () => {
    if (searchParams.name) {
      callToast({
        variant: 'error',
        description: {
          es: 'No puedes reordenar los artículos mientras tienes filtros activos.',
          en: 'You cannot reorder articles while you have active filters.',
        },
      });
      return;
    }

    setIsOrderingItems((prev) => !prev);
  };

  const handleChangeOrder = (newOrder: number[]) => {
    setOrderedIds(newOrder);
  };

  const handleSaveOrder = async () => {
    if (!orderedIds || orderedIds.length === 0) {
      setIsOrderingItems(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await securePost<LangMap>({
        endpoint:
          SECURE_ENDPOINTS.AUCTIONS.REORDER_MY_AUCTION_ARTICLES(auctionId),
        data: {
          order: orderedIds,
        },
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }

      callToast({ variant: 'success', description: response.data });
    } catch (e: any) {
      sentryErrorReport(
        e?.message,
        `SAVE_ARTICLES_NEW_ORDER - ${SECURE_ENDPOINTS.AUCTIONS.REORDER_MY_AUCTION_ARTICLES(auctionId)}`
      );
    } finally {
      setIsLoading(false);
      setIsOrderingItems(false);
    }
  };

  const handleCancelOrder = () => {
    setOrderedIds(null);
    setIsOrderingItems(false);
  };

  const mergedHeader = (
    <>
      {ListHeaderComponent}
      <View className='mt-4'>
        <CustomText
          type='subtitle'
          className='text-center text-3xl text-cinnabar'
        >
          {auctionLang.articles}
        </CustomText>
      </View>
      <View className='my-4 flex flex-row items-end gap-3'>
        <View className='flex-[0.55]'>
          <MyAuctionArticlesFilters
            isDisabled={isOrderingItems}
            locale={locale}
          />
        </View>

        {!isOrderingItems ? (
          <View className='flex flex-[0.45] flex-col gap-2'>
            {(auctionStatus === AuctionStatus.NOT_AVAILABLE ||
              auctionStatus === AuctionStatus.PARTIALLY_AVAILABLE ||
              auctionStatus === AuctionStatus.AVAILABLE) && (
              <CustomLink
                mode='primary'
                href={`(tabs)/auctioneer/my-auctions/${auctionId}/new-article`}
              >
                {auctionLang.newArticle}
              </CustomLink>
            )}
            {auctionStatus === AuctionStatus.AVAILABLE && (
              <Button
                mode='secondary'
                textClassName='text-center'
                onPress={toggleOrderingItems}
              >
                {auctionLang.rearrangeArticles}
              </Button>
            )}
          </View>
        ) : (
          <View className='flex flex-[0.45] flex-col gap-2'>
            <Button
              mode='primary'
              textClassName='text-center'
              onPress={handleSaveOrder}
              isLoading={isLoading}
            >
              {auctionLang.saveOrder}
            </Button>

            <Button
              mode='secondary'
              textClassName='text-center'
              onPress={handleCancelOrder}
              disabled={isLoading}
            >
              {auctionLang.cancel}
            </Button>
          </View>
        )}
      </View>
      {isOrderingItems && (
        <CustomText
          type='body'
          className='mb-2 text-base text-slate-600'
        >
          {auctionLang.dragInstructions}
        </CustomText>
      )}
    </>
  );

  return (
    <>
      <View className='flex-1'>
        <MyAuctionArticles
          ListHeaderComponent={mergedHeader}
          lang={locale}
          auctionStatus={auctionStatus}
          auctionId={auctionId}
          texts={{
            editText: auctionLang.edit,
            deleteText: auctionLang.delete,
            removeText: auctionLang.remove,
            orderImagesText: auctionLang.orderImages,
            featuredText: auctionLang.setAsFeatured,
            unfeaturedText: auctionLang.unsetAsFeatured,
          }}
          order={effectiveOrder}
          isOrderingItems={isOrderingItems}
          onChangeOrder={handleChangeOrder}
        />
      </View>
    </>
  );
};
