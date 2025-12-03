import { useMemo } from 'react';
import { View } from 'react-native';
import { Lang, Article, LangMap } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import {
  ARTICLE_BRANDS_LABELS,
  ARTICLE_STATUS_LABELS,
  ArticleStatus,
} from '@/constants';
import { CustomImage } from '../ui/CustomImage';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { AuctionStatus } from '@/constants/auctions';
import { CustomLink } from '../ui/CustomLink';
import { ConfirmModal } from '../modal/ConfirmModal';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

type MyArticleItemProps = {
  article: Article;
  texts: {
    editText: string;
    deleteText: string;
    removeText: string;
    orderImagesText: string;
    featuredText: string;
    unfeaturedText: string;
  };
  auctionId: string;
  formatter: Intl.NumberFormat;
  locale: Lang;
  commissionValue: number;
  showActions: boolean;
  auctionStatus: AuctionStatus;
  refetch: () => void;
};

const MODAL_TITLE_REMOVE = {
  es: 'Eliminar artículo de la subasta',
  en: 'Remove article from auction',
};

const MODAL_DESCRIPTION_REMOVE = {
  es: 'Después de esta acción, no podrás agregar de nuevo este artículo. ¿Estás seguro de que quieres realizar esta acción?',
  en: 'After this action, you will not be able to add this article again. Are you sure you want to perform this action?',
};

const MODAL_TITLE_FEATURE = {
  es: 'Destacar artículo',
  en: 'Feature article',
};

const MODAL_TITLE_UNFEATURE = {
  es: 'Quitar artículo de destacado',
  en: 'Unfeature article',
};

export function MyArticleItem({
  article,
  texts: {
    editText,
    deleteText,
    removeText,
    orderImagesText,
    featuredText,
    unfeaturedText,
  },
  auctionId,
  formatter,
  locale,
  commissionValue,
  showActions,
  auctionStatus,
  refetch,
}: MyArticleItemProps) {
  const { callToast } = useToast(locale);
  const { securePost } = useSecureApi();
  const price = article.ArticleBid.currentValue;

  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(price, commissionValue),
    [price, commissionValue]
  );

  const statusColor =
    article.status === ArticleStatus.NEED_CHANGES
      ? 'text-[#ff0000]'
      : article.status === ArticleStatus.PUBLISHED
        ? 'text-green-600'
        : 'text-black';

  const removeArticle = async () => {
    const endpoint = SECURE_ENDPOINTS.AUCTIONS.REMOVE_ARTICLE(
      auctionId,
      article.id
    );
    try {
      const response = await securePost<LangMap>({
        endpoint: endpoint,
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }

      refetch?.();

      callToast({ variant: 'success', description: response.data });
    } catch (e: any) {
      sentryErrorReport(
        e?.message,
        `REMOVE_ARTICLE_FROM_AUCTION - ${endpoint}`
      );
    }
  };

  const toggleArticleFeatured = async () => {
    const endpoint = SECURE_ENDPOINTS.AUCTIONS.TOGGLE_ARTICLE_FEATURED(
      auctionId,
      article.id
    );
    try {
      const response = await securePost<LangMap>({
        endpoint: endpoint,
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }

      callToast({ variant: 'success', description: response.data });
    } catch (e: any) {
      sentryErrorReport(e?.message, `TOGGLE_ARTICLE_FEATURED - ${endpoint}`);
    }
  };

  if (!article.images || article.images.length === 0) {
    return null;
  }

  return (
    <View className='flex w-full gap-5 px-5'>
      <View className='aspect-square w-2/3 self-center overflow-hidden rounded-xl'>
        <CustomImage
          src={article.images[0]}
          alt={article.title}
          className='h-full w-full'
          resizeMode='cover'
        />
      </View>

      <View className='flex-col items-start'>
        <View className='flex flex-col'>
          <CustomText
            type='body'
            className='text-cinnabar'
          >
            {article.id}
          </CustomText>

          <CustomText
            type='h4'
            className={statusColor}
          >
            {ARTICLE_STATUS_LABELS[locale][article.status]}
          </CustomText>
          <CustomText
            type='h4'
            className=''
          >
            {article.title} |{' '}
            {
              ARTICLE_BRANDS_LABELS[
                article.brand as keyof typeof ARTICLE_BRANDS_LABELS
              ]
            }
          </CustomText>
          <CustomText
            type='subtitle'
            className='text-lg'
          >
            {formatter.format(commissionedPrice)}
          </CustomText>
        </View>
      </View>
      {showActions && (
        <View className='mt-4 flex w-full flex-row flex-wrap gap-3'>
          {(auctionStatus === AuctionStatus.NOT_AVAILABLE ||
            auctionStatus === AuctionStatus.NEED_CHANGES ||
            auctionStatus === AuctionStatus.CHANGES_MADE ||
            ((auctionStatus === AuctionStatus.WAITING_MIN_ARTICLES_AMOUNT ||
              auctionStatus === AuctionStatus.PARTIALLY_AVAILABLE) &&
              (article.status === ArticleStatus.NOT_PUBLISHED ||
                article.status === ArticleStatus.NEED_CHANGES ||
                article.status === ArticleStatus.CHANGES_MADE))) &&
            article.status !== ArticleStatus.APPROVED &&
            article.status !== ArticleStatus.PUBLISHED && (
              <>
                <View className='min-w-[45%] flex-1'>
                  <CustomLink
                    href={`/(tabs)/my-auctions/${auctionId}/rearrange-article-images/${article.id}`}
                    mode='primary'
                    size='small'
                  >
                    {orderImagesText}
                  </CustomLink>
                </View>
                <View className='min-w-[45%] flex-1'>
                  <CustomLink
                    href={`/(tabs)/my-auctions/${auctionId}/edit-article/${article.id}`}
                    mode='secondary'
                    size='small'
                  >
                    {editText}
                  </CustomLink>
                </View>
              </>
            )}
          {article.status === ArticleStatus.PUBLISHED &&
            auctionStatus !== AuctionStatus.FINISHED && (
              <View className='min-w-[45%] flex-1'>
                <ConfirmModal
                  mode='primary'
                  onConfirm={toggleArticleFeatured}
                  title={
                    article.isFeatured
                      ? MODAL_TITLE_UNFEATURE
                      : MODAL_TITLE_FEATURE
                  }
                  description={
                    article.isFeatured
                      ? {
                          es: '¿Quieres quitar este artículo de destacado?',
                          en: 'Do you want to unfeature this article?',
                        }
                      : {
                          es: '¿Quieres destacar este artículo?',
                          en: 'Do you want to feature this article?',
                        }
                  }
                  locale={locale}
                >
                  {article.isFeatured ? unfeaturedText : featuredText}
                </ConfirmModal>
              </View>
            )}
          {(auctionStatus === AuctionStatus.AVAILABLE ||
            auctionStatus === AuctionStatus.PARTIALLY_AVAILABLE) && (
            <View className='min-w-[45%] flex-1'>
              <ConfirmModal
                mode='primary'
                onConfirm={removeArticle}
                title={MODAL_TITLE_REMOVE}
                description={MODAL_DESCRIPTION_REMOVE}
                locale={locale}
              >
                {removeText}
              </ConfirmModal>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
