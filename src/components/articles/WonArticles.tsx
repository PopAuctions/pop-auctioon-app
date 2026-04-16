import React, { useMemo, useState } from 'react';
import { View, SectionList } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomText } from '@/components/ui/CustomText';
import { AuctionUserWonArticles, CustomArticle, Lang } from '@/types/types';
import { CustomImage } from '@/components/ui/CustomImage';
import { ConfirmModal } from '../modal/ConfirmModal';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';

type WonArticlesProps = {
  wonArticles: Record<string, AuctionUserWonArticles>;
  lang: Lang;
  commissionValue: number;
  texts: {
    winningBid: string;
    payArticles: string;
    view: string;
    noArticlesWon: string;
    removeArticles: string;
  };
  refetchArticles?: () => void;
};

type SectionItemRow = CustomArticle[];

export const WonArticles = ({
  wonArticles,
  lang,
  commissionValue,
  texts: { winningBid, payArticles, view, noArticlesWon, removeArticles },
  refetchArticles,
}: WonArticlesProps) => {
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean> | null>(
    null
  );
  const { callToast } = useToast(lang);
  const { securePost } = useSecureApi();
  const formatter = euroFormatter(lang);

  const handleRemoveArticles = async (auctionId: string) => {
    setIsRemoving((prev) => ({ ...prev, [auctionId]: true }));
    const articlesId = wonArticles[auctionId].articles.map(
      (article) => article.id
    );

    try {
      if (articlesId.length === 0) {
        callToast({
          variant: 'error',
          description: {
            es: 'No hay artículos para eliminar',
            en: 'There are no articles to remove',
          },
        });
        return;
      }

      const response = await securePost({
        endpoint: SECURE_ENDPOINTS.USER.REMOVE_WON_ARTICLES,
        data: {
          auctionId: auctionId,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: {
            es: 'Error al eliminar los artículos',
            en: 'Error removing articles',
          },
        });
        return;
      }

      callToast({
        variant: 'success',
        description: {
          es: 'Artículos eliminados correctamente',
          en: 'Articles removed successfully',
        },
      });

      refetchArticles?.();
    } finally {
      setIsRemoving((prev) => ({ ...prev, [auctionId]: false }));
    }
  };

  const sections = useMemo(() => {
    return Object.entries(wonArticles).map(([auctionId, data]) => {
      // chunk into rows of 2 for a grid look
      const rows: SectionItemRow[] = [];
      for (let i = 0; i < data.articles.length; i += 2) {
        rows.push(data.articles.slice(i, i + 2));
      }

      return {
        auctionId,
        title: data.title,
        data: rows,
        displayHideButton: data.displayHideButton,
      };
    });
  }, [wonArticles]);

  if (sections.length === 0) {
    return (
      <View className='flex-1 items-center justify-center p-6'>
        <CustomText
          type='h2'
          className='text-center text-cinnabar'
        >
          {noArticlesWon}
        </CustomText>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(row, index) =>
        `${row[0]?.id ?? 'row'}-${row[1]?.id ?? 'x'}-${index}`
      }
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      renderSectionHeader={({ section }) => (
        <View className='my-5 flex-row items-center justify-between rounded-2xl bg-white px-5 py-2'>
          <CustomText
            className='w-3/5 self-center'
            type='h3'
          >
            {section.title}
          </CustomText>

          <View className='flex w-2/5 flex-col gap-2'>
            <CustomLink
              mode='primary'
              size='small'
              href={`/(tabs)/account/payment?auctionId=${section.auctionId}`}
            >
              {payArticles}
            </CustomLink>
            {section.displayHideButton && (
              <ConfirmModal
                mode='secondary'
                onConfirm={async () => {
                  await handleRemoveArticles(section.auctionId);
                }}
                isDisabled={isRemoving?.[section.auctionId]}
                title={{
                  es: 'Eliminar artículos de esta subasta',
                  en: 'Remove auction won articles',
                }}
                description={{
                  es: '¿Estás seguro de que quieres quitar los artículos ganados en esta subasta?',
                  en: 'Are you sure you want to remove the won articles in this auction?',
                }}
                importantMessage={{
                  es: 'No los podrás recuperar después de eliminarlos',
                  en: 'You will not be able to recover them after removing',
                }}
                locale={lang}
              >
                {removeArticles}
              </ConfirmModal>
            )}
          </View>
        </View>
      )}
      renderItem={({ item: row }) => (
        <View
          className='flex-row'
          style={{ gap: 12 }}
        >
          {row.map((article) => (
            <WonArticleItem
              key={article.id.toString()}
              article={article}
              texts={{ winningBid, view }}
              commissionValue={commissionValue}
              formatter={formatter}
            />
          ))}

          {/* if odd count, fill the empty space so layout stays aligned */}
          {row.length === 1 ? <View className='flex-1' /> : null}
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
  );
};

type WonArticleItemProps = {
  article: CustomArticle;
  texts: { winningBid: string; view: string };
  commissionValue: number;
  formatter: Intl.NumberFormat;
};

export const WonArticleItem = ({
  article,
  texts: { winningBid, view },
  commissionValue,
  formatter,
}: WonArticleItemProps) => {
  const soldPrice = article.soldPrice;
  const commissionedSoldPrice = useMemo(
    () => getArticleCommissionedPrice(soldPrice, commissionValue),
    [soldPrice, commissionValue]
  );

  const imageSrc = article.images?.[0];

  return (
    <View className='flex-1'>
      <View className='w-full rounded-2xl bg-white p-3'>
        <View className='w-full overflow-hidden rounded-xl'>
          <CustomImage
            src={imageSrc}
            alt='Article Image'
            className='aspect-square w-full'
            resizeMode='cover'
          />
        </View>

        <View className='mt-3'>
          <View className='flex flex-col items-start'>
            <CustomText
              type='subtitle'
              className='leading-5'
            >
              {winningBid}:
            </CustomText>
            <CustomText
              type='subtitle'
              className='leading-5'
            >
              {formatter.format(commissionedSoldPrice)}
            </CustomText>
          </View>

          <CustomText type='h4'>{article.title}</CustomText>

          <CustomLink
            mode='secondary'
            href={`/(tabs)/auctions/articles/${article.id}`}
            className='mt-2 self-start'
          >
            {view}
          </CustomLink>
        </View>
      </View>
    </View>
  );
};
